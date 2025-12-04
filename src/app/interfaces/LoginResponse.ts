export interface LoginResponse {
    userId: number;
    token: string;
    displayName: string;
    avatarUrl?: string;
    followingCount: number;
    followersCount: number;
    role: string;
    isTwoFactorEnabled: boolean;
    requiresTwoFactor: boolean;
    message?: string;
  }

