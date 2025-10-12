import mongoose, { Schema } from 'mongoose'

export interface UserDoc {
  _id: mongoose.Types.ObjectId
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
)

export const UserModel = mongoose.models.User || mongoose.model<UserDoc>('User', userSchema)
