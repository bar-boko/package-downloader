import { createLogger, format, transports } from "winston";

export const Logger = createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.json(),
  ),
  transports: [
    new transports.File({
      filename: 'error.log',
      level: 'error',
    }),
    new transports.Console({
      format: format.simple(),
    }),
  ],
});
