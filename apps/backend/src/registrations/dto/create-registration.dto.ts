import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { FunnelStage } from '@prisma/client';

export class CreateRegistrationDto {
  @ApiProperty({
    description: 'Initial funnel stage',
    enum: FunnelStage,
    example: 'INITIATED',
    required: false
  })
  @IsOptional()
  @IsEnum(FunnelStage)
  funnelStage?: FunnelStage;

  @ApiProperty({
    description: 'Additional notes for the registration',
    example: 'Initial draft registration',
    required: false,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes cannot exceed 1000 characters' })
  @MinLength(1, { message: 'Notes must not be empty if provided' })
  notes?: string;
}
