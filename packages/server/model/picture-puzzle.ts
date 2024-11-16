import { CollectionSchema, MapSchema, Schema, type } from "@colyseus/schema";
import { GameRoomState } from "./game-room";

class PuzzleState extends Schema {
  @type({ collection: "number" }) solution = new CollectionSchema<number>();
  @type({ map: "boolean" }) solvedById = new MapSchema<boolean>();
}

class PicturePuzzleState extends GameRoomState {
  @type({ collection: PuzzleState }) puzzles =
    new CollectionSchema<PuzzleState>();
}

export { PicturePuzzleState };
