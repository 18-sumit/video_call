import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Call } from "../models/calls.models.js";

const initiateCall = asyncHandler(async (req, res) => {

    const { roomId, callId } = req.body;
    if (!roomId || !callId) {
        throw new ApiError(404, "RoomId and CallerId not found");
    }

    req.app.get("io").to(roomId).emit("callstarted", { callId });

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            roomId,
            "call started successfully"
        ))
});


const endCall = asyncHandler(async (req, res) => {
    const { roomId, callerId } = req.body;
    if (!roomId || !callerId) {
        throw new ApiError(400, "RoomId and CallerId are required");
    }
    // emit event to notify user that call has ended;
    req.app.get('io').to(roomId).emit("Call ended", { callerId })

    return res
        .status(200)
        .message(new ApiResponse(
            200,
            { roomId },
            "Call ended successfully"
        ))
});

const handleOffer = (socket) => {
    socket.on("offer", ({ offer, roomId }) => {
        console.log(`Offer sent from ${socket.id} to ${roomId}`);
        socket.to(roomId).emit("receiveOffer", { offer, from: socket.id });
    });
};


const handleAnswer = (socket) => {
    socket.on("sendAnswer", ({ answer, roomId }) => {
        console.log(`Answer sent from ${socket.id} to ${roomId}`);
        socket.to(roomId).emit("receiveAnswer", { answer, from: socket.id });
    })
}


const handleICECandidate = (socket) => {
    socket.on("sendICECandidate", ({ candidate, roomId }) => {
        console.log(`ICE Candidate sent from ${socket.id} to ${roomId}`);
        socket.to(roomId).emit("receiveICECandidate", { candidate, from: socket.id });
    });
};


const getCallHistory = asyncHandler(async (req, res) => {

    const { userId } = req.params;
    const callLogs = await Call.find({ participants: userId });

    if (!callLogs.length) {
        throw new ApiError(404, "No call history found for this user.");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { callLogs },
                "Call History fetched Successfully"
            ))
})

export {
    initiateCall,
    endCall,
    handleOffer,
    handleAnswer,
    handleICECandidate,
    getCallHistory,
}