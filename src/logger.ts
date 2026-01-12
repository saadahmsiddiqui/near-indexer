import winston from "winston";

export const createLogger = (service: string) =>
  winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service },
    transports: [new winston.transports.Console({})],
  });
