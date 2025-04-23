import mongoose from "mongoose";

const TranscriptSchema = new mongoose.Schema(
    {
        meetingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meeting",
            required: true
        },
        participants: [String],
        
        fullTranscript: {
            type: String,
            required: true
        },
        summary: {
            type: String
        },
        keyPoints: [String],
        actionItems: [String],
        language: {
            type: String,
            default: "auto"
        },

    },
    {
        timestamps: true
    }
);



export const Transcript = mongoose.models.Transcript || mongoose.model("Transcript", TranscriptSchema);