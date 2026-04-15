import { IsString, IsEnum, IsInt, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShiftType } from '../../../database/entities/booking.entity';
import { SkillType } from '../../../database/entities/worker.entity';

export class CreateBookingDto {
  @ApiProperty() @IsString() businessId: string;
  @ApiProperty() @IsDateString() shiftDate: Date;
  @ApiProperty({ enum: ShiftType }) @IsEnum(ShiftType) shiftType: ShiftType;
  @ApiProperty() @IsInt() @Min(1) workersRequired: number;
  @ApiPropertyOptional({ enum: SkillType }) @IsOptional() @IsEnum(SkillType) skillRequired?: SkillType;
  @ApiPropertyOptional() @IsOptional() @IsNumber() dailyWageOffered?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() supervisorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() instructions?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() locationLat?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() locationLng?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() startTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endTime?: string;
}
