import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Worker, WorkerStatus } from '../../database/entities/worker.entity';
import { Booking } from '../../database/entities/booking.entity';
import axios from 'axios';

export interface WhatsAppMessage {
  from: string; // worker's phone number
  body: string;
  type: 'text' | 'audio' | 'interactive';
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly WHATSAPP_TOKEN: string;
  private readonly PHONE_NUMBER_ID: string;

  constructor(
    private config: ConfigService,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {
    this.WHATSAPP_TOKEN = this.config.get('WHATSAPP_TOKEN') || '';
    this.PHONE_NUMBER_ID = this.config.get('WHATSAPP_PHONE_NUMBER_ID') || '';
  }

  // Webhook handler — processes incoming WhatsApp messages from workers
  async handleIncoming(message: WhatsAppMessage): Promise<void> {
    const phone = message.from.replace('whatsapp:', '').replace('+91', '');
    const worker = await this.workerRepo.findOne({ where: { phone } });

    const text = message.body?.toLowerCase().trim();

    // Hindi keyword detection
    if (text === 'काम' || text === 'kaam' || text === 'work') {
      await this.handleJobRequest(message.from, worker);
    } else if (text === 'आज नहीं' || text === 'aaj nahi' || text === 'no today' || text === '2') {
      await this.handleUnavailable(message.from, worker);
    } else if (text === 'हाँ' || text === 'haan' || text === 'yes' || text === '1') {
      await this.handleConfirmAvailability(message.from, worker);
    } else {
      await this.sendDefaultMenu(message.from, worker?.name || 'दोस्त');
    }
  }

  private async handleJobRequest(to: string, worker: Worker | null): Promise<void> {
    if (!worker) {
      await this.sendMessage(to, '❌ आप रजिस्टर्ड नहीं हैं। अपने सुपरवाइजर से संपर्क करें।');
      return;
    }

    // Find today's or tomorrow's available bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const booking = await this.bookingRepo.findOne({
      where: { status: 'pending' as any },
      relations: ['business'],
      order: { shiftDate: 'ASC' },
    });

    if (!booking) {
      await this.sendMessage(to,
        `नमस्ते ${worker.name}! 🙏\n\n` +
        `अभी कोई काम available नहीं है।\n` +
        `हम आपको जल्द सूचित करेंगे।\n\n` +
        `आपकी Reliability Score: ⭐ ${worker.reliabilityScore}/5`
      );
      return;
    }

    await this.sendInteractiveMessage(to, {
      header: `काम Available है! 🎉`,
      body:
        `📍 Location: ${booking.location || booking.business?.city || 'TBD'}\n` +
        `📅 Date: ${new Date(booking.shiftDate).toLocaleDateString('hi-IN')}\n` +
        `⏰ Shift: ${booking.shiftType}\n` +
        `💰 Wage: ₹${booking.dailyWageOffered || worker.dailyWageRate || 400}/day\n\n` +
        `क्या आप काम करना चाहते हैं?`,
      buttons: [
        { id: 'accept_job', title: '✅ हाँ, काम करूँगा' },
        { id: 'decline_job', title: '❌ नहीं, आज नहीं' },
      ],
    });
  }

  private async handleUnavailable(to: string, worker: Worker | null): Promise<void> {
    if (worker) {
      await this.workerRepo.update(worker.id, { status: WorkerStatus.UNAVAILABLE });
      await this.sendMessage(to, `ठीक है ${worker.name}। आज आपको काम नहीं भेजेंगे। 👍\n\nकल के लिए हम आपसे संपर्क करेंगे।`);
    }
  }

  private async handleConfirmAvailability(to: string, worker: Worker | null): Promise<void> {
    if (worker) {
      await this.workerRepo.update(worker.id, { status: WorkerStatus.AVAILABLE });
      await this.sendMessage(to, `✅ आपकी availability confirm हो गई!\nसुपरवाइजर जल्द ही आपसे संपर्क करेगा।`);
    }
  }

  private async sendDefaultMenu(to: string, name: string): Promise<void> {
    await this.sendInteractiveMessage(to, {
      header: `नमस्ते ${name}! 🙏`,
      body: 'आप क्या करना चाहते हैं?',
      buttons: [
        { id: 'request_work', title: '💼 काम चाहिए' },
        { id: 'not_available', title: '🚫 आज उपलब्ध नहीं' },
      ],
    });
  }

  // Send daily availability ping to all workers
  async sendDailyAvailabilityPing(): Promise<void> {
    const workers = await this.workerRepo.find({
      where: { isActive: true, status: WorkerStatus.AVAILABLE },
    });

    for (const worker of workers) {
      const to = `+91${worker.phone}`;
      await this.sendInteractiveMessage(to, {
        header: 'आज का काम 🌅',
        body: `${worker.name}, आज आप काम के लिए available हैं?\nPlease confirm करें:`,
        buttons: [
          { id: 'available', title: '✅ हाँ, available हूँ' },
          { id: 'unavailable', title: '❌ आज नहीं' },
        ],
      });

      // Throttle: 1 message per second to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Send attendance summary to business owner
  async sendAttendanceSummary(phone: string, summary: {
    businessName: string; date: string;
    present: number; required: number;
  }): Promise<void> {
    await this.sendMessage(
      phone,
      `📊 *Attendance Update — ${summary.date}*\n\n` +
      `Business: ${summary.businessName}\n` +
      `✅ Present: ${summary.present}/${summary.required} workers\n` +
      `📈 ${Math.round((summary.present / summary.required) * 100)}% fulfillment\n\n` +
      `Details: Login to dashboard for full report.`
    );
  }

  async sendMessage(to: string, text: string): Promise<void> {
    if (!this.WHATSAPP_TOKEN) {
      this.logger.log(`[MOCK WhatsApp → ${to}]: ${text}`);
      return;
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v18.0/${this.PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        },
        { headers: { Authorization: `Bearer ${this.WHATSAPP_TOKEN}` } }
      );
    } catch (err) {
      this.logger.error(`WhatsApp send failed: ${err.message}`);
    }
  }

  private async sendInteractiveMessage(to: string, opts: {
    header: string; body: string; buttons: { id: string; title: string }[]
  }): Promise<void> {
    if (!this.WHATSAPP_TOKEN) {
      this.logger.log(`[MOCK WhatsApp Interactive → ${to}]: ${opts.body}`);
      return;
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v18.0/${this.PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'interactive',
          interactive: {
            type: 'button',
            header: { type: 'text', text: opts.header },
            body: { text: opts.body },
            action: {
              buttons: opts.buttons.map(b => ({
                type: 'reply',
                reply: { id: b.id, title: b.title },
              })),
            },
          },
        },
        { headers: { Authorization: `Bearer ${this.WHATSAPP_TOKEN}` } }
      );
    } catch (err) {
      this.logger.error(`WhatsApp interactive send failed: ${err.message}`);
    }
  }
}
