import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Firebase ID token and get session JWT' })
  @ApiBody({ type: VerifyTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Token verified successfully', 
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid Firebase token' 
  })
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    return this.authService.verifyFirebaseToken(verifyTokenDto.idToken);
  }

  @Post('test-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate test JWT token for development' })
  @ApiResponse({ 
    status: 200, 
    description: 'Test token generated successfully' 
  })
  async generateTestToken() {
    return this.authService.generateTestToken();
  }

  @Post('test-support-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate test SUPPORT JWT token for development' })
  @ApiResponse({ 
    status: 200, 
    description: 'Test SUPPORT token generated successfully' 
  })
  async generateSupportTestToken() {
    return this.authService.generateSupportTestToken();
  }
}
