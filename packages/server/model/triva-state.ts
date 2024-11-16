import { CollectionSchema, MapSchema, Schema, type } from "@colyseus/schema";

import { GameRoomState } from "./game-room";

class QuestionAnswerState extends Schema {
  @type("number") answerIndex: number;
  @type({ map: "number" }) answersById = new MapSchema<number>();
}

class QuestionState extends Schema {
  @type("number") id: number;
  @type("string") question: string;
  @type({ collection: "string" }) choices = new CollectionSchema<string>();
  @type(QuestionAnswerState) answersState = new QuestionAnswerState();
}

class TriviaState extends GameRoomState {
  @type({ collection: QuestionState }) questions =
    new CollectionSchema<QuestionState>();
  @type("number") questionId: number;
}

export { TriviaState };
