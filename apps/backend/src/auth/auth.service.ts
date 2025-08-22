import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
  ) {}

  async verifyFirebaseToken(idToken: string) {
    try {
      // Verify Firebase ID token
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
      
      // Get or create user
      let user = await this.usersService.findByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        // Create new user if doesn't exist
        const firebaseUser = await this.firebaseService.getUserByUid(decodedToken.uid);
        user = await this.usersService.create({
          firebaseUid: decodedToken.uid,
          phone: firebaseUser.phoneNumber || '',
          role: UserRole.OWNER, // Default role for new users
        });
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      // Generate JWT token
      const payload = {
        sub: user.firebaseUid,
        uid: user.firebaseUid,
        role: user.role,
        societyId: null,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        access_token: accessToken,
        user: {
          id: user.id,
          firebaseUid: user.firebaseUid,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          societyId: null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async generateTestToken() {
    // Generate a test JWT token for development purposes using seeded user
    const payload = {
      sub: 'owner_firebase_uid_789',
      uid: 'owner_firebase_uid_789',
      id: 'owner-user-id',
      role: 'OWNER',
      societyId: null,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: 'owner-user-id',
        firebaseUid: 'owner_firebase_uid_789',
        phone: '+1234567892',
        role: 'OWNER',
        isActive: true,
        societyId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      message: 'This is a test token for development only!'
    };
  }

  async generateSupportTestToken() {
    // Generate a test JWT token for SUPPORT role testing using seeded user
    const payload = {
      sub: 'support_firebase_uid_123',
      uid: 'support_firebase_uid_123',
      id: 'support-user-id',
      role: 'SUPPORT',
      societyId: null,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: 'support-user-id',
        firebaseUid: 'support_firebase_uid_123',
        phone: '+1234567890',
        role: 'SUPPORT',
        isActive: true,
        societyId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      message: 'This is a test SUPPORT token for development only!'
    };
  }
}
