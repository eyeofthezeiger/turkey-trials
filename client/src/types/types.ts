// client/types.ts

export interface GameState {
    board: string[];
    currentTurn: string;
    winner: string | null;
    gameInProgress: boolean;
  }
  