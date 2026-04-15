import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AttendanceStatus } from '../../../database/entities/attendance.entity';

export class MarkAttendanceDto {
  @IsString() workerId: string;
  @IsEnum(AttendanceStatus) status: AttendanceStatus;
  @IsOptional() @IsString() notes?: string;
}
