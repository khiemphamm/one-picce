import winston from 'winston';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Safely determine a default log directory that isn't root
// Use temp dir as fallback to avoid Permission Denied on /logs
const getDefaultLogDir = () => {
  try {
    // Try current directory first (fine for dev)
    const cwd = process.cwd();
    if (cwd === '/') {
      return path.join(os.tmpdir(), 'tool-live-logs');
    }
    return path.join(cwd, 'logs');
  } catch {
    return path.join(os.tmpdir(), 'tool-live-logs');
  }
};

let logDir = getDefaultLogDir();

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger with only console initially to avoid early file system errors
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}] ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          return msg;
        })
      ),
    }),
  ],
});

// Production transport setup
export const setLogDirectory = (dir: string) => {
  logDir = dir;
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Add file transports now that we have a safe path
    logger.add(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
      })
    );
    logger.add(
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
      })
    );

    logger.info(`Log directory set to: ${logDir}`);
  } catch (err) {
    console.error(`Failed to set log directory: ${err}`);
  }
};

// If we're in dev mode, we can set the log directory immediately
if (process.env.NODE_ENV === 'development') {
  setLogDirectory(path.join(process.cwd(), 'logs'));
}

export default logger;
