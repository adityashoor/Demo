import { Controller, Post, Get, Body, Query, Res, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IvrService } from './ivr.service';
import { Response } from 'express';

@ApiTags('IVR (Missed Call System)')
@Controller('ivr')
export class IvrController {
  constructor(private readonly ivrService: IvrService) {}

  // Exotel fires this when someone gives a missed call
  @Post('missed-call')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exotel missed-call webhook' })
  async handleMissedCall(@Body() body: any) {
    const callerPhone = body.CallFrom || body.From;
    await this.ivrService.handleMissedCall(callerPhone);
    return { status: 'ok' };
  }

  // Worker pressed a key during IVR
  @Post('keypress')
  @HttpCode(200)
  @ApiOperation({ summary: 'IVR key press handler' })
  async handleKeyPress(@Body() body: any, @Res() res: Response) {
    const xml = await this.ivrService.handleKeyPress(
      body.CallFrom || body.From,
      body.digits || body.Digits,
      body.CallSid,
    );
    res.set('Content-Type', 'text/xml');
    res.send(xml);
  }

  // Serve job inquiry IVR XML
  @Get('job-inquiry-xml')
  @ApiOperation({ summary: 'Job inquiry IVR XML (ExoML)' })
  getJobInquiryXml(@Res() res: Response) {
    res.set('Content-Type', 'text/xml');
    res.send(this.ivrService.getJobInquiryXml());
  }
}
