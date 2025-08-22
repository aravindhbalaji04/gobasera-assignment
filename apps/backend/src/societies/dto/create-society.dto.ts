import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateSocietyDto {
  @ApiProperty({
    description: 'Society name',
    example: 'Sample Society',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Society address',
    example: '123 Sample Street',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Society city',
    example: 'Sample City',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Society state',
    example: 'Sample State',
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Society pincode',
    example: '12345',
  })
  @IsString()
  pincode: string;


}
