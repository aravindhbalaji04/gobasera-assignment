import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export enum DocumentType {
  PAN = 'PAN',
  REGISTRATION_CERT = 'REGISTRATION_CERT',
  ADDRESS_PROOF = 'ADDRESS_PROOF',
  IDENTITY_PROOF = 'IDENTITY_PROOF',
  SOCIETY_REGISTRATION = 'SOCIETY_REGISTRATION',
  BANK_STATEMENT = 'BANK_STATEMENT',
  OTHER = 'OTHER'
}

export class CreatePresignedUrlDto {
  @ApiProperty({
    description: 'Name of the file to upload',
    example: 'identity_proof.pdf'
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf'
  })
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiProperty({
    description: 'Type of document',
    enum: DocumentType,
    example: DocumentType.IDENTITY_PROOF
  })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({
    description: 'ID of the registration this document belongs to',
    example: 'reg_123',
    required: false
  })
  registrationId?: string;
}
