import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ProcessWebhookDto {
  @ApiProperty({
    description: 'Razorpay payment ID',
    example: 'pay_1234567890'
  })
  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @ApiProperty({
    description: 'Razorpay order ID',
    example: 'order_1234567890'
  })
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'COMPLETED'
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'Webhook signature for verification',
    example: 'sha256=abc123...',
    required: false
  })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiProperty({
    description: 'Additional webhook data',
    example: '{"error_code": null}',
    required: false
  })
  @IsOptional()
  @IsString()
  additionalData?: string;
}
