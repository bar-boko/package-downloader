import download from 'download';
import { allSettled } from 'bluebird';
import fs from 'fs';
import { Logger } from '../utils/Logger';
import { getSourcePath, getTargetPath } from '../utils/NameUtils';

export interface DownloadTask {
  sourceDir: string;
  fileName: string;
  targetDir: string;
}

const checkIfFileExists = async (downloadTask: DownloadTask): Promise<boolean> => {
  const targetPath = getTargetPath(downloadTask);
  
  try {
    return fs.existsSync(targetPath);
  }
  catch (error) {
    Logger.error(`Could not check if file '${targetPath} exists`, error);

    return false;
  }
};

const createTargetDir = async (targetDir: string): Promise<void> => {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    catch (error) {
      throw error;
    }
};

const executeDownloadTask = async (downloadTask: DownloadTask) => {
  const sourcePath = getSourcePath(downloadTask);
  const { targetDir } = downloadTask;

  try {
    await download(sourcePath, targetDir);

    Logger.info(`Successful Download '${sourcePath}'`)
  }
  catch (error) {
    Logger.error(`Failed Download '${sourcePath}'`, error);
  }
};

const createDownloadTaskExecuter = async (downloadTask: DownloadTask) => {
  const { targetDir } = downloadTask;
  const sourcePath = getSourcePath(downloadTask);

  await createTargetDir(targetDir);
  const fileExists = await checkIfFileExists(downloadTask);

  if (fileExists) {
    Logger.warn(`File '${targetDir} already exists - Skipping`);

    return;
  }

  Logger.info(`Downloading '${sourcePath}' to '${targetDir}`);
  await executeDownloadTask(downloadTask);
};

export default async (...tasks: DownloadTask[]) => {
  const taskPromises = tasks.map(createDownloadTaskExecuter);

  return await allSettled(taskPromises);
}