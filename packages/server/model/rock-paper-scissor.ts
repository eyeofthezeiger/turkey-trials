import { CollectionSchema, MapSchema, Schema, type } from "@colyseus/schema";

import { GameRoomState } from "./game-room";

class RockPaperScissorMatch extends Schema {
  @type("string") winnerId: string;
  @type("string") playerOneId: string;
  @type("string") playerTwoId: string;
  @type("string") playerOneChoice: string;
  @type("string") playerTwoChoice: string;
  @type("boolean") isDraw: boolean;
}

class TournamentRound extends Schema {
  @type({ map: RockPaperScissorMatch }) matches =
    new MapSchema<RockPaperScissorMatch>();
}

class RockPaperScissorState extends GameRoomState {
  @type({ collection: TournamentRound }) rounds =
    new CollectionSchema<TournamentRound>();
  @type("number") roundIndex: number;
}

export { RockPaperScissorState };
