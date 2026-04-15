import { Controller, Post, Get, Body, Query, Res, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('WhatsApp Bot')
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly config: ConfigService,
  ) {}

  // Meta webhook verification
  @Get('webhook')
  @ApiOperation({ summary: 'WhatsApp webhook verification (Meta)' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = this.config.get('WHATSAPP_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === verifyToken) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  }

  // Incoming messages from workers
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive incoming WhatsApp messages' })
  async receiveMessage(@Body() body: any) {
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return { status: 'ok' };

    for (const msg of messages) {
      await this.whatsappService.handleIncoming({
        from: msg.from,
        body: msg.text?.body || msg.interactive?.button_reply?.id || '',
        type: msg.type,
      });
    }

    return { status: 'ok' };
  }

  @Post('ping/availability')
  @ApiOperation({ summary: 'Send daily availability ping to all workers' })
  sendDailyPing() {
    return this.whatsappService.sendDailyAvailabilityPing();
  }
}
