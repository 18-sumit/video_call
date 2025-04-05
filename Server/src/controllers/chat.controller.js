import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Chat } from "../models/chat.models.js";
import { getIO } from "../sockets.js";
import { isValidObjectId } from "mongoose";


const sendMessage = asyncHandler(async (req, res) => {

    const { roomId, message } = req.body;
    const sender = req.user._id;

    if (!roomId || !message) {
        throw new ApiError(400, "RoomId and message is required");
    }

    const newMsg = await Chat.create({
        roomId,
        sender,
        message
    })

    const populatedMsg = await newMsg.populate("sender", "name email");
    getIO().to(roomId).emit("new-message", populatedMsg);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { populatedMsg },
                "Message sent"
            )
        )
});

// Get all messages for a room:

const getAllMessages = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    if (!roomId) {
        throw new ApiError(400, "RoomId is required");
    }

    const messages = await Chat.find({ roomId })
        .populate("sender", "name email")
        .sort({ createdAt: 1 })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { messages },
                "All messages fetched"
            )
        )
});

//  Delete message for self (soft delete)
const deleteMessageForSelf = asyncHandler(async (req, res) => {

    const { messageId } = req.params;
    if (!isValidObjectId(messageId)) {
        throw new ApiError(400, "Valid messageId is required");
    }

    const userId = req.user._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Valid userId is reqiured");
    }

    const msg = await Chat.findById(messageId);
    if (!msg) {
        throw new ApiError(404, "Message not found");
    }

    msg.deletedFor.push(userId);
    await msg.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Message deleted for you",
            )
        )
})




export {
    sendMessage,
    getAllMessages,
    deleteMessageForSelf
}