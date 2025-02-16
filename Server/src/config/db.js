import mongoose from "mongoose";
import { DB_NAME } from "../utils/constants.js";
import logger from "../logger.js";
import dotenv from "dotenv";
import { ApiError } from "../utils/ApiError.js"

dotenv.config();

if (!DB_NAME) {
    throw new ApiError(
        400,
        "Please define the DB_NAME in constant.js file"
    );
}

const connectDB = async () => {
    try {

        const MONGODB_URI = `${process.env.MONGODB_URI}/${DB_NAME}`;
        const connectionInstance = await mongoose.connect(MONGODB_URI);

        logger.info(`MONGODB connected with HOST: ${connectionInstance.connection.host}`);

    } catch (error) {
        logger.error(`MONGODB connection failed due to : ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;