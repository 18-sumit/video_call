import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./logger.js";

dotenv.config({
    path: "/.env"
})

try {
    await connectDB();

    app.on("error", (error) => {
        logger.error("Error", error);
    });

    app.listen(process.env.PORT || 4000, () => {
        logger.info(`Server is running on PORT : ${process.env.PORT}`);
    });

} catch (error) {
    logger.error(`MONGODB connection failed due to : ${error.message}`);
}