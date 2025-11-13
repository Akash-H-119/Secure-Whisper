import mongoose from 'mongoose';

const { Schema } = mongoose;

const MessageSchema = new Schema({
  chatId: { type: String, required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true }, // encrypted payload (base64)
  iv: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Compound index to speed retrieval by chat and date
MessageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.model('Message', MessageSchema);
