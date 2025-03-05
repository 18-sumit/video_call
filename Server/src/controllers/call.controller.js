import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Call } from "../models/calls.models.js";





const initiateCall = asyncHandler(async (req, res) => {

    const { roomId, callerId } = req.body;
    if (!roomId || !callerId) {
        throw new ApiError(404, "RoomId and CallerId not found");
    }

    req.app.get("io").to(roomId).emit("callstarted", { callerId });

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            roomId,
            "call started successfully"
        ))
});




const endCall = asyncHandler(async (req, res) => {


});














export {
    initiateCall,
    endCall,

}