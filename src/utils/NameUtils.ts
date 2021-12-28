import path from 'path';
import { NpmPackage } from "../models/Packages";

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