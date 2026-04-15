import { IsString } from 'class-validator';

export class OtpCheckInDto {
  @IsString() workerId: string;
  @IsString() bookingId: string;
  @IsString() otp: string;
}
