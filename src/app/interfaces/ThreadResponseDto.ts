
import { StastsInterface } from "./StatsInterface";
import { UserInterface } from "./UserInterface";

export interface ThreadResponse {
    id: number;
    author: UserInterface;
    categoryName: string | null;
    posts: string[];
    createdAt: string;
    stats: StastsInterface;

}