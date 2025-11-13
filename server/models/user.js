import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: false, unique: true, sparse: true, index: true },
  password_hash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Virtual `password` to set and hash
UserSchema.virtual('password')
  .set(function(password) {
    this._password = password;
  })
  .get(function() { return this._password; });

// Pre-save hook to hash password if provided via virtual
UserSchema.pre('save', async function(next) {
  try {
    // If password_hash is already set, skip hashing (existing user)
    if (this.password_hash && !this.isNew && !this.isModified('password')) {
      return next();
    }
    // Hash the password if it was provided via the virtual setter
    if (this._password) {
      const hash = await bcrypt.hash(this._password, 10);
      this.password_hash = hash;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Helper to compare password
UserSchema.methods.verifyPassword = function(password) {
  return bcrypt.compare(password, this.password_hash);
};

export default mongoose.model('User', UserSchema);
