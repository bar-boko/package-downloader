import { keys, mergeAll, values, head } from "ramda";
import downloader from "../tools/Downloader";
import { DependencyFlattenTree, PackageTarballs } from "../models/Packages";
import { DownloadTask } from "../tools/Downloader";
import { Logger } from "../utils/Logger";
import { extractSourcePath, getTargetFileDir } from "../utils/NameUtils";
import { CommandLineOptions } from "../models/Input";

const getPackagesTarballs = (
  dependencies: DependencyFlattenTree
): PackageTarballs => {
  const packagesAndTarballs = keys(dependencies).map((packageName) => ({
    [packageName]: values(dependencies[packageName]),
  }));

  return mergeAll(packagesAndTarballs);
};

const createDownloadTask =
  (targetDir: string) =>
  (sourcePath: string): DownloadTask => {
    const { fileName, sourceDir } = extractSourcePath(sourcePath);

    return {
      sourceDir,
      fileName,
      targetDir,
    };
  };

const getDownloadTasksFromTarballs = (
  outputDir: string,
  flatten: boolean,
  packageTarballs: PackageTarballs
): DownloadTask[] => {
  const packageNames = keys(packageTarballs).map((x) => x as string);

  return packageNames.flatMap((packageName) => {
    const tarballs = packageTarballs[packageName];
    const firstTarball = head(tarballs) as string;
    const targetDir = getTargetFileDir(
      outputDir,
      flatten,
      packageName,
      firstTarball
    );

    return tarballs.map(createDownloadTask(targetDir));
  });
};

export default async (
  { output: outputDir, flatten, throttleLimit }: CommandLineOptions,
  dependencies: DependencyFlattenTree
) => {
  Logger.info("=================================");
  Logger.info("Downloading Stage -       Started");
  Logger.info("=================================");

  const packageTarballs = getPackagesTarballs(dependencies);
  const downloadTasks = getDownloadTasksFromTarballs(
    outputDir,
    flatten ?? false,
    packageTarballs
  );

  await downloader(throttleLimit, ...downloadTasks);

  Logger.info("=================================");
  Logger.info("Downloading Stage -      Finished");
  Logger.info("=================================");
};
