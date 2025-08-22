import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { DocumentType } from './create-presigned-url.dto';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'ID of the registration this document belongs to',
    example: 'reg_123'
  })
  @IsString()
  @IsNotEmpty()
  registrationId: string;

  @ApiProperty({
    description: 'Type of document',
    enum: DocumentType,
    example: DocumentType.IDENTITY_PROOF
  })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({
    description: 'S3 key for the uploaded file',
    example: 'uploads/user123/reg123/IDENTITY_PROOF/file.pdf'
  })
  @IsString()
  @IsNotEmpty()
  s3Key: string;

  @ApiProperty({
    description: 'Public URL for the document',
    example: 'http://localhost:9000/bucket/uploads/user123/reg123/IDENTITY_PROOF/file.pdf'
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2024-01-01T00:00:00.000Z',
    required: false
  })
  @IsOptional()
  uploadedAt?: Date;
}
