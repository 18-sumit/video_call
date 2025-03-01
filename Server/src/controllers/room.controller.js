import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Room } from "../models/room.models.js";
import mongoose, { isValidObjectId } from "mongoose"


const createRoom = asyncHandler(async (req, res) => {
    const { roomName, maxParticipants } = req.body;

    if (!roomName && !maxParticipants) {
        throw new ApiError()
    }

    // Validate if maxParticipants is a number and greater than 0
    if (maxParticipants && typeof maxParticipants !== "number" || maxParticipants <= 0) {
        throw new ApiError(400, "maxParticipants must be a positive number");
    }

    const newRoom = new Room({
        roomName,
        maxParticipants,
        createdBy: req.user.id, // User ID jo room create kar raha hai
        participants: [req.user.id], // Initially creator hee pehla participant hoga
    })


    // Save the new room to the database
    await newRoom.save();

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

    if (!isValidObjectId(roomId)) {
        throw new ApiError(400, "Invalid roomId")
    }
    const room = await Room.findById(roomId).populate("participants", "name");

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

    // find return always returns an array (even if no documents are found) so hame 0 rooms ke liye bhi check karenge

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
    const userId = req.user.id;

    if (!isValidObjectId(roomId) || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid roomID or userID");
    }


    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(404, "No rooms found");
    }

    if (room.participants.includes(userId)) {
        throw new Error(
            400,
            "User already in the room"
        )
    }

    if (room.participants.length >= room.maxParticipants) {
        throw new ApiError(
            400,
            "Room is Full"
        )
    }

    room.participants.push(userId);
    await room.save()

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
    const userId = req.user.id;

    if (!isValidObjectId(roomId) || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid roomID or userID");
    }


    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    room.participants = room.participants.filter(id => id.toString() !== userId);

    // If no participants left, delete the room
    if (room.participants.length === 0) {
        await Room.findByIdAndDelete(roomId);
        return res.json({ message: "Room deleted as no participant left" });
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
    
});

export {
    createRoom,
    getRoomById,
    getAllRooms,
    joinRoom,
    leaveRoom,
    deleteRoom
}