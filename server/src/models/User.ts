import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  githubId?: string;
  password?: string; // ✅ GitHub 계정은 비밀번호 없을 수 있음
  provider: "local" | "github"; // ✅ 로그인 방식 구분
  createdAt: Date;
  resetPasswordToken?: string; // 해시 저장
  resetPasswordExpires?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    lowercase: false, // ✅ 대소문자 구분 허용
    unique: true,
  },

  githubId: {
    type: String,
    sparse: true, // ✅ githubId 없을 때 중복 허용
    unique: true,
  },

  password: {
    type: String,
    required: function () {
      return this.provider === "local"; // ✅ 일반 로그인만 필수
    },
  },

  provider: {
    type: String,
    enum: ["local", "github"],
    default: "local",
  },

  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

export default mongoose.model<IUser>("User", UserSchema, "users");
