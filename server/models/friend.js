import mongoose from 'mongoose';

const { Schema } = mongoose;

const FriendSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  friend: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

// Prevent duplicates
FriendSchema.index({ user: 1, friend: 1 }, { unique: true });

export default mongoose.model('Friend', FriendSchema);
