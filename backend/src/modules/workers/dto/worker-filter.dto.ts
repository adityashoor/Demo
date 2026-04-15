import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkerStatus, SkillType } from '../../../database/entities/worker.entity';

export class WorkerFilterDto {
  @IsOptional() @IsEnum(WorkerStatus) status?: WorkerStatus;
  @IsOptional() @IsEnum(SkillType) skill?: SkillType;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() supervisorId?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit: number = 20;
}
