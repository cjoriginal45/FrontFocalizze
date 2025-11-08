export interface UserInterface {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isFollowing: boolean;
  followingCount: number;
  followersCount: number;
}
