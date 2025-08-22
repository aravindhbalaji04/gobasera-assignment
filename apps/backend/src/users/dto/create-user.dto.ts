import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'Firebase UID',
    example: 'firebase_uid_123',
  })
  @IsString()
  firebaseUid: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.OWNER,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Society ID (optional)',
    example: 'society_123',
    required: false,
  })
  @IsOptional()
  @IsString()
  societyId?: string;
}
