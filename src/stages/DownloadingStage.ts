import { keys, mergeAll, values, last, init, head } from 'ramda';
import { resolve, sep } from 'path';
import downloader from '../tools/Downloader';
import { DependencyFlattenTree, PackageTarballs } from '../models/Packages';
import { DownloadTask } from '../tools/Downloader';
import { Logger } from '../utils/Logger';
import { getTargetFileDir } from '../utils/NameUtils';

const getPackagesTarballs = (dependencies: DependencyFlattenTree): PackageTarballs => {
  const packagesAndTarballs = keys(dependencies)
    .map(packageName => ({
      [packageName]: values(dependencies[packageName])
    }));

  return mergeAll(packagesAndTarballs);
}

const createDownloadTask = (targetDir: string) => (sourcePath: string): DownloadTask => {
  const sourcePathParts = sourcePath.split(sep);
  const fileName = last(sourcePathParts) as string;
  const sourceDirParts = init(sourcePathParts);
  const sourceDir = resolve(...sourceDirParts);

  return {
    sourceDir,
    fileName,
    targetDir,
  };
}

const getDownloadTasksFromTarballs = (outputDir: string, packageTarballs: PackageTarballs): DownloadTask[] => {
  const packageNames = keys(packageTarballs)
    .map(x => x as string);

  return packageNames.flatMap(packageName => {
    const tarballs = packageTarballs[packageName];
    const firstTarball = head(tarballs) as string;
    const targetDir = getTargetFileDir(outputDir, packageName, firstTarball);

    return tarballs.map(createDownloadTask(targetDir));
  });
};

export default async (outputDir: string, dependencies: DependencyFlattenTree) => {
  Logger.info('Downloading Stage - Started');

  const packageTarballs = getPackagesTarballs(dependencies);
  const downloadTasks = getDownloadTasksFromTarballs(outputDir, packageTarballs);
  
  await downloader(...downloadTasks);

  Logger.info('Downloading Stage - Finished');
};