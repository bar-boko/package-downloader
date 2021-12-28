import { keys, mergeAll, values } from 'ramda';
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

const getDownloadTasksFromTarballs = (outputDir: string, packageTarballs: PackageTarballs): DownloadTask[] => {
  const keysss = keys(packageTarballs);

  const aaa = keysss.map(packageName => {
    const tarballs = packageTarballs[packageName];
    const firstTarball: string = tarballs[0];
    const targetDir = getTargetFileDir(outputDir, packageName as string, firstTarball);

    return tarballs.map(sourcePath => ({
      sourcePath,
      targetDir,
    }));
  });

  return aaa.flatMap(x => x);
};

export default async (outputDir: string, dependencies: DependencyFlattenTree) => {
  Logger.info('Downloading Stage - Started');

  const packageTarballs = getPackagesTarballs(dependencies);
  const downloadTasks = getDownloadTasksFromTarballs(outputDir, packageTarballs);
  
  await downloader(...downloadTasks);

  Logger.info('Downloading Stage - Finished');
};