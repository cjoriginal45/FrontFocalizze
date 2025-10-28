export interface LikeToggledEvent {
  threadId: number;
  isLiked: boolean; // Para saber si se dio o se quitó el like / To know if the like was given or removed
}
