import { UserInterface } from "./UserInterface";

export interface ThreadResponse {
    id: number;
    author: UserInterface;
    categoryName: string;
    posts: string[];
    createdAt: string; // LocalDateTime se recibe como un string en formato ISO 8601
  }