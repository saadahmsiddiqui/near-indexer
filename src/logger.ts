import winston from "winston";

export const createLogger = (service: string) =>
  winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service },
    transports: [
      new winston.transports.File({
        filename: `${service}-error.log`,
        level: "error",
      }),
      new winston.transports.File({ filename: `${service}-combined.log` }),
    ],
  });
