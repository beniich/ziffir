import winston from 'winston';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (more readable for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${message} ${stack || ''}`;
  })
);

// Create the logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    // Write all logs with importance level of `error` or higher to `error.log`
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../../logs/error.log'), 
      level: 'error' 
    }),
    // Write all logs with importance level of `info` or higher to `combined.log`
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../../logs/combined.log') 
    }),
  ],
});

// If we're not in production, log to the `console` with the custom format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}
