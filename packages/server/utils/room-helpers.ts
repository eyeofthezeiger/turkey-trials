import { MapSchema } from "@colyseus/schema";

import { Player } from "../model/game-player";

const LOBBY_GAME_TYPE = "lobby" as const;
const RED_LIGHT_GAME_TYPE = "redLightGreenLight" as const;
const TIC_TAC_TOE_GAME_TYPE = "ticTacToe" as const;
const ROCK_PAPER_SCISSOR_GAME_TYPE = "rockPaperScissors" as const;
const PICTURE_PUZZLE_GAME_TYPE = "picturePuzzle" as const;
const END_GAME_TYPE = "end" as const;
const ERROR_GAME_TYPE = "error" as const;

const isRoomEmpty = (players: MapSchema<Player>): boolean => players.size === 0;

const getNextGameType = (gameType: string): string => {
  switch (gameType) {
    case LOBBY_GAME_TYPE:
      return RED_LIGHT_GAME_TYPE;
    case RED_LIGHT_GAME_TYPE:
      return TIC_TAC_TOE_GAME_TYPE;
    case TIC_TAC_TOE_GAME_TYPE:
      return ROCK_PAPER_SCISSOR_GAME_TYPE;
    case ROCK_PAPER_SCISSOR_GAME_TYPE:
      return PICTURE_PUZZLE_GAME_TYPE;
    case PICTURE_PUZZLE_GAME_TYPE:
      return END_GAME_TYPE;
    default:
      return ERROR_GAME_TYPE;
  }
};

export {
  isRoomEmpty,
  getNextGameType,
  LOBBY_GAME_TYPE,
  RED_LIGHT_GAME_TYPE,
  TIC_TAC_TOE_GAME_TYPE,
  ROCK_PAPER_SCISSOR_GAME_TYPE,
  PICTURE_PUZZLE_GAME_TYPE,
  END_GAME_TYPE,
  ERROR_GAME_TYPE,
};

export const GAME_TYPE_LABELS: Record<string, string> = {
  [LOBBY_GAME_TYPE]: "Lobby",
  [RED_LIGHT_GAME_TYPE]: "Red Light, Green Light",
  [TIC_TAC_TOE_GAME_TYPE]: "Tic Tac Toe",
  [ROCK_PAPER_SCISSOR_GAME_TYPE]: "Rock Paper Scissors",
  [PICTURE_PUZZLE_GAME_TYPE]: "Sliding Puzzle",
  [END_GAME_TYPE]: "Game Over",
  [ERROR_GAME_TYPE]: "Error",
};

/**
 * Get the label for the current game type
 * @param gameType - The current game type
 * @returns A human-readable label for the game type
 */
 export const getGameTypeLabel = (gameType: string): string =>
 GAME_TYPE_LABELS[gameType] || "Unknown Game";
