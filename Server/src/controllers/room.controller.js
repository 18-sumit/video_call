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
        roomId: nanoid(),
        roomName,
        maxParticipants,
        createdBy: req.user.id, // User ID jo room create kar raha hai
        participants: [req.user.id], // Initially creator hee pehla participant hoga
    })

    logger.info(newRoom);


    // Save the new room to the database
    // await newRoom.save();

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
    const userId = req.user?.id;


    if (!userId) {
        console.log("Error: Invalid user ID");
        throw new ApiError(400, "Invalid user ID");
    }

    // RoomId is a string (not ObjectId), so use findOne instead findById
    const room = await Room.findOne({ roomId });

    if (!room) {
        throw new ApiError(404, "No rooms found");
    }

    console.log("Current Participants:", room.participants);
    console.log("Max Participants:", room.maxParticipants);

    if (room.participants.includes(userId)) {
        console.log("Error: User already in the room");
        throw new Error(
            400,
            "User already in the room"
        )
    }

    if (room.participants.length >= room.maxParticipants) {
        console.log("Error: Room is full");
        throw new ApiError(
            400,
            "Room is Full"
        )
    }

    room.participants.push(userId);
    await room.save();
    console.log("User joined successfully:", userId);


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
    console.log("Room ID:", roomId, "User ID:", userId); // Debugging step


    if (!roomId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid roomID or userID");
    }


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
    console.log("Left the room Successfully");

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

    if (!isValidObjectId(roomId) || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid roomID or userID");
    }

    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(
            404, "Room not found"
        )
    }

    if (room?.createdBy[0].toString() !== req.userId.toString()) {
        throw new ApiError(
            400,
            "Only owner can delete the room"
        )
    }

    await Room.findByIdAndDelete(roomId);


    return res
        .status(204) // No Content as no further data needs to be sent
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