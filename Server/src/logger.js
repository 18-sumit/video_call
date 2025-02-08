import { createLogger, format, transports } from "winston";

const logger = createLogger({
    level: "info",
    format: format.combine(format.timestamp(),
        format.json()),

    transports: [
        new transports.Console({
            format: format.combine(format.colorize(),
                format.printf(
                    (
                        {
                            level,
                            message,
                            timestamp
                        }
                    ) => {
                        return `[${timestamp}] , ${level} : ${message}`;
                    }
                )),
        }),
    ],

});

export default logger;