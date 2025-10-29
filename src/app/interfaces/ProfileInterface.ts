export interface ProfileInterface {
  username: string;
  displayName: string;
  avatarUrl: string;
  biography: string;
  followers: number;
  follow: number; 
  threadCount: number;
  threadsAvailableToday: number | null; 
  registerDate: string; 
}