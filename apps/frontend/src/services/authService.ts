import { 
  RecaptchaVerifier,
  User as FirebaseUser,
  signInWithPhoneNumber
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    phone: string;
    role: 'SUPPORT' | 'COMMITTEE' | 'OWNER';
  };
}

export interface VerifyTokenRequest {
  idToken: string;
}

class AuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  // Initialize reCAPTCHA verifier
  initRecaptcha(containerId: string): Promise<RecaptchaVerifier> {
    return new Promise((resolve, reject) => {
      try {
        this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: () => {
            resolve(this.recaptchaVerifier!);
          },
          'expired-callback': () => {
            reject(new Error('reCAPTCHA expired'));
          }
        });
        // Don't resolve immediately - wait for the callback
      } catch (error) {
        reject(error);
      }
    });
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<any> {
    if (!this.recaptchaVerifier) {
      throw new Error('reCAPTCHA not initialized');
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, this.recaptchaVerifier);
      return confirmationResult;
    } catch (error: any) {
      console.error('Firebase OTP error:', error);
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format. Please use +91 format.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later.');
      } else if (error.code === 'auth/quota-exceeded') {
        throw new Error('SMS quota exceeded. Please try again later.');
      } else {
        throw new Error(`Failed to send OTP: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Verify OTP and sign in
  async verifyOTP(confirmationResult: any, otp: string): Promise<FirebaseUser> {
    try {
      const result = await confirmationResult.confirm(otp);
      return result.user;
    } catch (error) {
      throw new Error('Invalid OTP');
    }
  }

  // Get Firebase ID token and verify with backend
  async verifyWithBackend(firebaseUser: FirebaseUser): Promise<AuthResponse> {
    try {
      const idToken = await firebaseUser.getIdToken();
      
      const response = await api.post<AuthResponse>('/auth/verify', {
        idToken
      });

      // Store the session JWT token
      localStorage.setItem('authToken', response.data.accessToken);
      
      return response.data;
    } catch (error) {
      throw new Error('Failed to verify with backend');
    }
  }

  // Complete login flow
  async loginWithPhone(phoneNumber: string, otp: string): Promise<AuthResponse> {
    try {
      // Send OTP and get confirmation result
      const confirmationResult = await this.sendOTP(phoneNumber);
      
      // Verify OTP and get Firebase user
      const firebaseUser = await this.verifyOTP(confirmationResult, otp);
      
      // Verify with backend and get session JWT
      const authResponse = await this.verifyWithBackend(firebaseUser);
      
      return authResponse;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem('authToken');
    auth.signOut();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export default new AuthService();
