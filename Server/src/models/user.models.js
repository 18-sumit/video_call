import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, "Please use a valid email address"]
        },
        password: {
            type: String,
            required: () => {
                return !this.clerkId
            },
            select: false,
            validate: {
                validator: (v) => {
                    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(v);
                },
                message: "Password must be at least 8 characters long and contain at least one letter and one number.",
            },
        },
        clerkId: {
            type: String,
            unique: true,
            sparse: true
        },
        resetPasswordToken: String,
    },
    {
        timestamps: true
    }
)


UserSchema.pre('save', async function (next) {

    if (!this.isModified('password')) return next(); // skip if password not modified

    this.password = await bcrypt.hash(this.password, 10); // hash the password
})


UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// Short lived Tokens
UserSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// long lived Tokens
UserSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.models.User || mongoose.model("User", UserSchema)