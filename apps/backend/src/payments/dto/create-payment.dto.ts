import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum Currency {
  INR = 'INR',
  USD = 'USD',
  EUR = 'EUR'
}

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID of the registration this payment belongs to',
    example: 'reg_123'
  })
  @IsString()
  @IsNotEmpty()
  registrationId: string;

  @ApiProperty({
    description: 'Razorpay order ID',
    example: 'order_1234567890'
  })
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @ApiProperty({
    description: 'Payment amount in smallest currency unit (paise for INR)',
    example: 100000
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Payment currency',
    enum: Currency,
    example: Currency.INR,
    required: false
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({
    description: 'Additional payment metadata',
    example: '{"description": "Registration fee"}',
    required: false
  })
  @IsOptional()
  @IsString()
  metadata?: string;
}
