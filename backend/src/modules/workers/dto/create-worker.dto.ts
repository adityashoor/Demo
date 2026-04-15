import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsArray, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SkillType } from '../../../database/entities/worker.entity';

export class CreateWorkerDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() phone: string;
  @ApiPropertyOptional() @IsOptional() @IsString() alternatePhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() aadhaarNumber?: string;
  @ApiPropertyOptional({ enum: SkillType, isArray: true })
  @IsOptional() @IsArray() @IsEnum(SkillType, { each: true }) skills?: SkillType[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() dailyWageRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() preferredLanguage?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasSmartphone?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() supervisorId?: string;
}
