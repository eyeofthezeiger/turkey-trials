import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  hostId: string;
  status: string;
  round: number;
}

const SessionSchema: Schema = new Schema({
  hostId: { type: String, required: true },
  status: { type: String, required: true, index: true },
  round: { type: Number, default: 1 },
});

export default mongoose.model<ISession>('Session', SessionSchema);
