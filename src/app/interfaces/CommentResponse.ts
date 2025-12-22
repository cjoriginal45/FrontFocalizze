import { UserInterface } from './UserInterface';

export interface CommentResponseDto {
  id: number;
  content: string;
  createdAt: string;
  author: UserInterface;
  replies: CommentResponseDto[];
}
