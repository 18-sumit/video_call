import mongoose from "mongoose";
import { DB_NAME } from "../utils/constants.js";
import logger from "../logger.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {

        const MONGO_URI = `${process.env.MONGO_URI}/${DB_NAME}`;
        const connectionInstance = await mongoose.connect(MONGO_URI);

        logger.info(`MONGODB connected with HOST: ${connectionInstance.connection.host}`);

    } catch (error) {
        logger.error(`MONGODB connection failed due to : ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;