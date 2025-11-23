import { FeedThreadDto } from './FeedThread';

export interface DiscoverItemDto {
  thread: FeedThreadDto;
  isRecommended: boolean;
  recommendationReason: string;
  recommendationType: string;
}
