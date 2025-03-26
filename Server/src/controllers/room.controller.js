import { nanoid } from "nanoid";
import { Room } from "../models/room.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose"
import logger from "../logger.js";


const createRoom = asyncHandler(async (req, res) => {
    const { roomName, maxParticipants } = req.body;

    if (!roomName || !maxParticipants) {
        throw new ApiError(400, "roomName and maxParticipants are required");
    }

    // Validate if maxParticipants is a number and greater than 0
    if (typeof maxParticipants !== "number" || maxParticipants <= 0) {
        throw new ApiError(400, "maxParticipants must be a positive number");
    }

    const newRoom = await Room.create({
        // CHANGED: Keep the nanoid as a separate field
        roomId: nanoid(), // Unique string identifier
        roomName,
        maxParticipants,
        createdBy: req.user.id,
        participants: [req.user.id],
    })

    logger.info(newRoom);

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                newRoom,
                "Room created successfully"
            )
        )
});


const getRoomById = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    // CHANGED: Modified room finding logic
    const room = await Room.findOne({ roomId }).populate("participants", "name");

    if (!room) {
        throw new ApiError(404, "Room not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                room,
                "Got room by it's ID"
            )
        )
})

const getAllRooms = asyncHandler(async (req, res) => {
    const rooms = await Room.find().populate("createdBy", "name");

    if (rooms.length === 0) {
        throw new ApiError(404, "No rooms found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                rooms,
                "All rooms"
            )
        )
})

const joinRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(400, "Invalid user ID");
    }

    // CHANGED: Find room by roomId instead of _id
    const room = await Room.findOne({ roomId });

    if (!room) {
        throw new ApiError(404, "No rooms found");
    }

    if (room.participants.includes(userId)) {
        throw new ApiError(400, "User already in the room");
    }

    if (room.participants.length >= room.maxParticipants) {
        throw new ApiError(400, "Room is Full");
    }

    room.participants.push(userId);
    await room.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                room,
                "Joined room successfully"
            )
        )
});

const leaveRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user?.id;

    // CHANGED: Find room by roomId
    const room = await Room.findOne({ roomId });
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    // Check if user is in the room
    if (!room.participants.includes(userId)) {
        throw new ApiError(400, "User is not in the room");
    }

    // Remove user from participants
    room.participants = room.participants.filter(id => id.toString() !== userId);

    // If no participants left, delete the room
    if (room.participants.length === 0) {
        await Room.deleteOne({ roomId });
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {},
                "Room deleted as no participant left"
            ));
    }

    // Save updated room
    await room.save();

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Left the room successfully"
        ))
});

const deleteRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    // CHANGED: Find room by roomId
    const room = await Room.findOne({ roomId });
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    // CHANGED: Fixed comparison of createdBy
    if (room.createdBy.toString() !== userId.toString()) {
        throw new ApiError(400, "Only owner can delete the room");
    }

    await Room.deleteOne({ roomId });

    return res
        .status(204)
        .json(
            new ApiResponse(
                204,
                { roomId },
                "Room deleted successfully"
            )
        )
});

export {
    createRoom,
    getRoomById,
    getAllRooms,
    joinRoom,
    leaveRoom,
    deleteRoom
}