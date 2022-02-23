import download from 'download';
import fs from 'fs';
import Bottleneck from 'bottleneck';
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

const createTargetDir = (targetDir: string): string | undefined => fs.mkdirSync(targetDir, { recursive: true });

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

const createDownloadTaskExecuter = (downloadTask: DownloadTask) => async () => {
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

export default async (throttleLimit: number, ...tasks: DownloadTask[]) => {
  const scheduler = new Bottleneck({
    minTime: 333,
    maxConcurrent: throttleLimit,
  });

  const taskPromises = tasks
    .map(createDownloadTaskExecuter)
    .map(x => scheduler.schedule(x.bind(this)));

  return await Promise.all(taskPromises);
}