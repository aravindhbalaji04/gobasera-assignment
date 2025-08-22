import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user_123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Whether the file is public',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
