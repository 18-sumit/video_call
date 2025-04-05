import mongoose, { Types } from "mongoose";


const CallSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        isActive: {
            type: Boolean,
            default: true  // Jab tak call active hai, yeh true rahega
        },
        caller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        reciever: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true
    }
)

export const Call = mongoose.models.Call || mongoose.model("Call", CallSchema);