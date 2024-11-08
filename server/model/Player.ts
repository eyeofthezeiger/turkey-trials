import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  name: string;
  sessionId: string;
}

const PlayerSchema: Schema = new Schema({
  name: { type: String, required: true },
  sessionId: { type: String, required: true, index: true },
});

export default mongoose.model<IPlayer>('Player', PlayerSchema);
