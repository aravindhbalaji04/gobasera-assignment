import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class ApproveRegistrationDto {
  @ApiProperty({
    description: 'Optional notes for approval',
    example: 'All documents verified and payment confirmed',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Additional approval metadata',
    example: '{"reviewer": "John Doe", "verificationDate": "2024-01-15"}',
    required: false
  })
  @IsOptional()
  @IsString()
  metadata?: string;
}
