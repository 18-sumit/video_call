import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Room } from "../models/room.models.js";

export const checkRoomAdmin = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;
    const userId = req.user.id

    const room = await Room.findOne({ roomId });

    if (!room) {
        throw new ApiError(
            404,
            "Room not found"
        )
    }

    if (room.createdBy.toString() !== userId.toString()) {
        throw new ApiError(403, "Only the room owner can perform this action")
    }

    next(); // continue if the user is owner
})
