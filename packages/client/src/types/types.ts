// client/types.ts

export interface GameState {
    board: string[];
    currentTurn: string;
    winner: string | null;
    gameInProgress: boolean;
  }
  

  // client/types.ts

export type Move = "rock" | "paper" | "scissors";

export interface RPSGameState {
  player1Move: Move | null;
  player2Move: Move | null;
  winner: string | null;
  gameInProgress: boolean;
}

// types.ts

export interface SlidingPuzzleRoomMessages {
  welcome: { message: string };
  puzzleStarted: { message: string };
  puzzleCompleted: { completionTime: number };
}

// types.ts

// types.ts

// types.ts

// types.ts

// types.ts

export interface RedLightGreenLightRoomMessages {
  light: { light: string };  // Correct type: message contains a 'light' object
  winner: { winner: string }; // Winner message
}

export interface RedLightGreenLightState {
  light: string;
  players: { [sessionId: string]: Player };
  automatic: boolean;
}

export interface Player {
  position: number;
}





