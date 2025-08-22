import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RejectRegistrationDto {
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Incomplete documentation provided',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Optional notes for rejection',
    example: 'Please provide complete address proof and bank statements',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Additional rejection metadata',
    example: '{"reviewer": "John Doe", "rejectionDate": "2024-01-15"}',
    required: false
  })
  @IsOptional()
  @IsString()
  metadata?: string;
}
