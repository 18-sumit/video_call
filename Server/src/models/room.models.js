import mongoose, { Schema } from "mongoose";


const RoomSchema = new mongoose.Schema(
    {
        roomName: {
            type: String,
            required: [true, "Room Name is required"],
            trim: true,
            minLength: 2,
            maxLength: 50
        },
        roomId: {
            type: String,
            required: true,
            unique: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        participants: [ // array cuz their will be multiple participants
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        maxParticipants: {
            type: Number,
            required: true,
            min: 1, // Ensure at least one participant
        }
        
    },
    { timestamps: true }
)

export const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema)