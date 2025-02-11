import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import logger from "../logger.js";
import { validationResult } from "express-validator";


const registeredUser = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res
            .status(400)
            .json({
                errors: errors.array()
            });
    try {
        const { name, email, password } = req.body
        console.log(req.body);

        logger.info(req.body);

        const existedUser = await User.findOne({
            $or: [{ name }, { email }]
        })

        if (existedUser) {
            throw new ApiError(
                409,
                "User with name or email already exists"
            )
        }

        const user = new User.create(
            {
                name,
                email,
                password
            }
        )

        const createdUser = await User.findById(user._id).select("-password refreshToken")
        if (!createdUser) {
            throw new ApiError(
                500,
                "Something went wrong while registering the user"
            )
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    createdUser,
                    "User registered successfully"
                )
            )
    } catch (error) {
        throw new ApiError(`Something went wrong due to ${error.message} Please try again`)
    }
});



const loginUser = asyncHandler(async (req, res) => {

})








export {
    registeredUser,
    loginUser
}