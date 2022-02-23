import path from 'path';
import { init, last } from 'ramda';
import { NpmPackage } from '../models/Packages';
import { DownloadTask } from '../tools/Downloader';

export const getPackageNameWithVersion = ({ name, version }: NpmPackage) => `${name}@${version}`;

const PATH_DIVIDER = '/';

export const getTargetFileDir = (outputDir: string, packageName: string, tarball: string): string => {
  const index = tarball.indexOf(packageName);
  const filePath = tarball
    .slice(index)
    .split(PATH_DIVIDER)
    .slice(0, -1);

  return path.resolve(outputDir, ...filePath);
}

export const getSourcePath = ({ sourceDir, fileName }: DownloadTask) => `${sourceDir}${PATH_DIVIDER}${fileName}`;
export const getTargetPath = ({ targetDir, fileName }: DownloadTask) => path.resolve(targetDir, fileName);

export const extractSourcePath = (sourcePath: string) => {
  const sourcePathParts = sourcePath.split(PATH_DIVIDER);
  const fileName = last(sourcePathParts) as string;
  const sourceDirParts = init(sourcePathParts);
  const sourceDir = sourceDirParts.join(PATH_DIVIDER);

  return {
    fileName,
    sourceDir,
  };
}