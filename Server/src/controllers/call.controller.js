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






const getCallHistory = asyncHandler(async (req, res) => {

    const { userId } = req.params;
    const callLogs = await Call.find({ participants: userId });

    if (!callLogs) {
        logger
    }
    return res
        .status(200)
        .message(new ApiResponse(
            200,
            { callLogs },
            "Call History fetched Successfully"
        ))
})







export {
    initiateCall,
    endCall,
    getCallHistory,
}