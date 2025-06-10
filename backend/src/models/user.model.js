import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new Schema(
  {
    githubUsername: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      minlength: 4,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    repos: [
      {
        name: String,
        html_url: String,
        clone_url: String,
        last_updateAt: Date,
      },
    ],
    hasGithubPermission: {
      type: Boolean,
      default: false,
    },
    profilePicture: { type: String, default: null },
    refreshToken: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      role: this.role,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
  );
  return token;
};

userSchema.methods.generateRefreshToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
  this.refreshToken = token;
  return token;
};

export const User = mongoose.model("User", userSchema);
