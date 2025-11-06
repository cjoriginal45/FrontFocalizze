export interface CategoryInterface {
    id: number | string;
    name: string;
    description: string;
    followerCount: number;
    isFollowedByCurrentUser: boolean;
  }