import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  societyId?: string;
}

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
