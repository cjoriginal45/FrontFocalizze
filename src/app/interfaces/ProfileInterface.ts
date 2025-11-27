export interface ProfileInterface {
  id:number;
  username: string;
  displayName: string;
  avatarUrl: string;
  biography: string;
  followers: number;
  follow: number; 
  threadCount: number;
  threadsAvailableToday: number | null; 
  registerDate: string; 
  isFollowing: boolean;
  followingCount: number;
  followersCount: number;
  isBlocked?: boolean;
}