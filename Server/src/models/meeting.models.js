import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema(
    {
        topic: {
            type: String,
            default: "Untitled meeting"
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true
        },
        participants: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        callId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Call"
        },
        transcript: {
            type: String
        },
        summary: {
            type: String
        },
        keyPoints: [String],
        actionItems: [String],
        startedAt: Date,
        endedAt: Date
    },
    {
        timestamps: true
    }
);


export const Meeting = mongoose.models.Meeting || mongoose.model("Meeting", MeetingSchema)