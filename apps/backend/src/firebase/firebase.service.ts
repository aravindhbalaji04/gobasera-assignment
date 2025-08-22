import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get('FIREBASE_PROJECT_ID'),
          privateKey: this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
          clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
        }),
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Firebase Admin SDK:', error);
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await this.firebaseApp.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw new Error('Invalid Firebase ID token');
    }
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.firebaseApp.auth().getUser(uid);
    } catch (error) {
      throw new Error('User not found');
    }
  }

  getAuth(): admin.auth.Auth {
    return this.firebaseApp.auth();
  }
}
