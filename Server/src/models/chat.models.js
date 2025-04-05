import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        isEdited: {
            type: Boolean,
            default: false
        },
        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // For soft-deleting messages for specific users
            }
        ]
    },
    {
        timestamps: true
    }
);

export const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);