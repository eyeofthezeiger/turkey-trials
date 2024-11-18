// Constants representing game types
export const LOBBY_GAME_TYPE = "lobby";
export const RED_LIGHT_GAME_TYPE = "redLightGreenLight";
export const TIC_TAC_TOE_GAME_TYPE = "ticTacToe";
export const ROCK_PAPER_SCISSOR_GAME_TYPE = "rockPaperScissors";
export const PICTURE_PUZZLE_GAME_TYPE = "picturePuzzle";
export const END_GAME_TYPE = "end";
export const ERROR_GAME_TYPE = "error";

/**
 * Get the next game type based on the current game type
 * @param gameType - The current game type
 * @returns The next game type
 */
export const getNextGameType = (gameType: string): string => {
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

/**
 * Map game type to readable game names for display
 */
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

/**
 * Determine if the game has reached the end
 * @param gameType - The current game type
 * @returns True if the game has ended, false otherwise
 */
export const isGameOver = (gameType: string): boolean =>
  gameType === END_GAME_TYPE;

/**
 * Check if the current user is the host
 * @param clientId - The client ID
 * @param hostId - The host ID from the room state
 * @returns True if the user is the host, false otherwise
 */
export const isUserHost = (clientId: string, hostId: string): boolean =>
  clientId === hostId;
