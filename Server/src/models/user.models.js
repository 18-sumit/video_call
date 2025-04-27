import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js"

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'User Name is required'],
            trim: true,
            minLength: 2,
            maxLength: 25
        },
        email: {
            type: String,
            required: [true, 'User Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, "Please use a valid email address"]
        },
        password: {
            type: String,
            required: function () {
                return !this.clerkId
            },
            select: false, // this will affect login query as we will have to add a select:true there
            validate: {
                validator: (v) => {
                    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(v);
                },
                message: "Password must be at least 8 characters long and contain at least one letter, one number, and one special character.",
            },
        },
        clerkId: {
            type: String,
            unique: true,
            sparse: true
        },
        resetPasswordToken: {
            type: String,
            select: false // Hide the token from normal queries
        },
        resetPasswordExpires: {
            type: Date
        }
    },
    {
        timestamps: true
    }
)


UserSchema.pre('save', async function (next) {

    if (!this.isModified('password')) return next(); // skip if password not modified

    try {
        this.password = await bcrypt.hash(this.password, 10); // Hash the password
        next();
    } catch (err) {
        next(err); // Error handling in case bcrypt fails
    }
})


UserSchema.methods.isPasswordCorrect = async function (password) {
    // console.log("Plain password:", password);
    // console.log("Hashed password in DB:", this.password);
    try {
        return await bcrypt.compare(password, this.password); // Compare hashed password
    } catch (err) {
        throw new ApiError(401, `Password comparison failed: ${err.message}`); // Error handling
    }
}

// Short lived Tokens
UserSchema.methods.generateAccessToken = async function () {
    try {
        return jwt.sign(
            {
                _id: this._id,
                name: this.name,
                email: this.email
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d' // Default expiry if env var is not set
            }
        );
    } catch (err) {
        throw new ApiError(500, `Error generating access token: ${err.message}`); // Error handling
    }
}

// long lived Tokens
UserSchema.methods.generateRefreshToken = async function () {
    try {
        return jwt.sign(
            {
                _id: this._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d' // Default expiry if env var is not set
            }
        );
    } catch (err) {
        throw new ApiError(500, `Error generating refresh token: ${err.message}`); // Error handling
    }
}

UserSchema.methods.generateResetPasswordToken = function () {

    const resetToken = jwt.sign(
        { _id: this._id },
        process.env.RESET_PASSWORD_SECRET,
        { expiresIn: '1h' }
    );

    this.resetPasswordToken = resetToken;
    this.resetPasswordExpires = Date.now() + 3600000; // 1hr expiry

    return resetToken;
}

// Method to check if reset token is expired 
UserSchema.methods.isResetPasswordTokenExpired = function () {
    return this.resetPasswordExpires < Date.now();
}

export const User = mongoose.models.User || mongoose.model("User", UserSchema)