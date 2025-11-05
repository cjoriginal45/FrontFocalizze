import { StastsInterface } from './StatsInterface';
import { UserInterface } from './UserInterface';

export interface FeedThreadDto {
  id: number;
  user: UserInterface;
  publicationDate: string; // La fecha viene como string
  posts: string[];
  stats: StastsInterface;
  isLiked: boolean;
  isSaved: boolean;
  categoryName?: string;
}
