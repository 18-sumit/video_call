import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    // No token available
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Synchronous token verification: should be wrapped in a try-catch
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired access token");
    }

    // Find user based on the decoded token
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    // If user is not found
    if (!user) {
        throw new ApiError(401, "User not found with this token");
    }

    // Attach user to the request object
    req.user = user;

    // Continue to the next middleware or route handler
    next();
});
