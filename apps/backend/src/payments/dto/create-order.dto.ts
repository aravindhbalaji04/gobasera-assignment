import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum Currency {
  INR = 'INR',
  USD = 'USD',
  EUR = 'EUR'
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID of the registration this order belongs to',
    example: 'reg_123'
  })
  @IsString()
  @IsNotEmpty()
  registrationId: string;

  @ApiProperty({
    description: 'Payment amount in smallest currency unit (paise for INR)',
    example: 100000
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Payment currency',
    enum: Currency,
    example: Currency.INR
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({
    description: 'Additional order metadata',
    example: '{"description": "Registration fee"}',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
