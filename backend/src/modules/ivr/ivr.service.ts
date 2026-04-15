import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Worker, WorkerStatus } from '../../database/entities/worker.entity';
import axios from 'axios';

/**
 * IVR Service — Handles missed-call system using Exotel/Knowlarity
 *
 * Flow:
 * 1. Worker gives missed call to platform number
 * 2. Exotel webhook fires → we auto-call back the worker
 * 3. IVR plays Hindi message:
 *    "काम चाहिए तो 1 दबाएं, काम cancel करना है तो 2 दबाएं"
 * 4. Worker presses key → we update their status
 */
@Injectable()
export class IvrService {
  private readonly logger = new Logger(IvrService.name);
  private readonly EXOTEL_API_KEY: string;
  private readonly EXOTEL_API_TOKEN: string;
  private readonly EXOTEL_SID: string;
  private readonly PLATFORM_NUMBER: string;

  constructor(
    private config: ConfigService,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
  ) {
    this.EXOTEL_API_KEY = this.config.get('EXOTEL_API_KEY') || '';
    this.EXOTEL_API_TOKEN = this.config.get('EXOTEL_API_TOKEN') || '';
    this.EXOTEL_SID = this.config.get('EXOTEL_SID') || '';
    this.PLATFORM_NUMBER = this.config.get('PLATFORM_PHONE_NUMBER') || '0000000000';
  }

  // Called when Exotel sends a missed-call webhook
  async handleMissedCall(callerPhone: string): Promise<void> {
    const phone = callerPhone.replace('+91', '').replace('0', '');
    const worker = await this.workerRepo.findOne({ where: { phone } });

    if (!worker) {
      this.logger.warn(`Unknown caller: ${callerPhone}`);
      // Auto-call back with registration message
      await this.callBack(callerPhone, 'register');
      return;
    }

    this.logger.log(`Missed call from worker ${worker.name} (${phone})`);
    await this.callBack(callerPhone, 'job_inquiry');
  }

  // Handle IVR key press response
  async handleKeyPress(callerPhone: string, digit: string, callSid: string): Promise<string> {
    const phone = callerPhone.replace('+91', '').replace('0', '');
    const worker = await this.workerRepo.findOne({ where: { phone } });

    if (!worker) return this.ivrXml('आप रजिस्टर्ड नहीं हैं। कृपया अपने सुपरवाइजर से संपर्क करें।');

    if (digit === '1') {
      await this.workerRepo.update(worker.id, { status: WorkerStatus.AVAILABLE });
      return this.ivrXml(`धन्यवाद ${worker.name}। आपका काम confirm हो गया। सुपरवाइजर जल्द संपर्क करेगा।`);
    } else if (digit === '2') {
      await this.workerRepo.update(worker.id, { status: WorkerStatus.UNAVAILABLE });
      return this.ivrXml(`ठीक है ${worker.name}। आज आपको काम नहीं भेजेंगे। धन्यवाद।`);
    }

    return this.ivrXml('गलत option। फिर से try करें।');
  }

  // Exotel call-back via API
  private async callBack(to: string, type: 'job_inquiry' | 'register'): Promise<void> {
    if (!this.EXOTEL_API_KEY) {
      this.logger.log(`[MOCK IVR] Would call back: ${to} with type: ${type}`);
      return;
    }

    const appletUrl = type === 'job_inquiry'
      ? `${this.config.get('API_BASE_URL')}/api/v1/ivr/job-inquiry-xml`
      : `${this.config.get('API_BASE_URL')}/api/v1/ivr/register-xml`;

    try {
      await axios.post(
        `https://api.exotel.com/v1/Accounts/${this.EXOTEL_SID}/Calls/connect`,
        new URLSearchParams({
          From: this.PLATFORM_NUMBER,
          To: to,
          CallerId: this.PLATFORM_NUMBER,
          Url: appletUrl,
          TimeLimit: '120',
          Record: 'false',
        }),
        {
          auth: { username: this.EXOTEL_API_KEY, password: this.EXOTEL_API_TOKEN },
        }
      );
    } catch (err) {
      this.logger.error(`Exotel callback failed: ${err.message}`);
    }
  }

  // Returns ExoML (Exotel's XML-based IVR language)
  private ivrXml(message: string, getInput = false): string {
    if (getInput) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN">${message}</Say>
  <Gather numDigits="1" action="/api/v1/ivr/keypress" method="POST" timeout="10">
    <Say language="hi-IN">काम चाहिए तो 1 दबाएं। काम नहीं चाहिए तो 2 दबाएं।</Say>
  </Gather>
</Response>`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN">${message}</Say>
  <Hangup/>
</Response>`;
  }

  getJobInquiryXml(): string {
    return this.ivrXml('नमस्ते! Labour Platform पर आपका स्वागत है।', true);
  }
}
