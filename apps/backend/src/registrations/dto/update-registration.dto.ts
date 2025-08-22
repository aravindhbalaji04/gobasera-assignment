import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FunnelStage } from '@prisma/client';

export class SocietyDetailsDto {
  @ApiProperty({
    description: 'Society name',
    example: 'Green Valley Society'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Society address',
    example: '123 Main Street'
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'City',
    example: 'Mumbai'
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'State',
    example: 'Maharashtra'
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Pincode',
    example: '400001'
  })
  @IsString()
  pincode: string;
}

export class UpdateRegistrationDto {
  @ApiProperty({
    description: 'Funnel stage',
    enum: FunnelStage,
    example: 'DOCUMENTS_UPLOADED',
    required: false
  })
  @IsOptional()
  @IsEnum(FunnelStage)
  funnelStage?: FunnelStage;

  @ApiProperty({
    description: 'Society details',
    type: SocietyDetailsDto,
    required: false
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocietyDetailsDto)
  societyDetails?: SocietyDetailsDto;

  @ApiProperty({
    description: 'Committee details (JSON string)',
    example: '{"chairman": "John Doe", "secretary": "Jane Smith"}',
    required: false
  })
  @IsOptional()
  @IsString()
  committeeDetails?: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Updated with society details',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
