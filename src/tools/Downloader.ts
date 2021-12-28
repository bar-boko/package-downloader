import download from 'download';
import Promise from 'bluebird';
import fs from 'fs';
import { Logger } from '../utils/Logger';

export interface DownloadTask {
  sourcePath: string;
  targetDir: string;
}

export default async (...tasks: DownloadTask[]) => {
  const taskPromises = tasks.map(({ sourcePath, targetDir }) => {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    catch (error) {
      return Promise.reject(error);
    }

    Logger.info('Downloading', sourcePath, 'to', targetDir);

    return download(sourcePath, targetDir)
      .then(() => Logger.info('Successful Download', sourcePath))
      .catch(error => {
        console.trace(error);
        Logger.error('Failed Download', sourcePath, error);
      });
  });

  return await Promise.allSettled(taskPromises);
}