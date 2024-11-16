import { CollectionSchema, MapSchema, Schema, type } from "@colyseus/schema";

import { GameRoomState } from "./game-room";

class Move extends Schema {
  @type("number") row: number;
  @type("number") column: number;
  @type("string") playerId: string;
}

class TicTacToeMatch extends Schema {
  @type("string") winnerId: string;
  @type("string") playerXId: string;
  @type("string") playerOId: string;
  @type({ collection: Move }) moves = new CollectionSchema<Move>();
  @type("boolean") isDraw: boolean;
}

class TournamentRound extends Schema {
  @type({ map: TicTacToeMatch }) matches = new MapSchema<TicTacToeMatch>();
  @type({ collection: "string" }) winnerIds = new CollectionSchema<string>();
}

class TicTacToeSessionState extends GameRoomState {
  @type({ collection: TournamentRound }) rounds =
    new CollectionSchema<TournamentRound>();
  @type("number") roundIndex: number;
}

export { TicTacToeSessionState };
