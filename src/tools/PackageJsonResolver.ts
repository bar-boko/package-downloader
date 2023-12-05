import { PackageJson, PackageJsonDependecies } from "../models/Input";
import { readFile } from "fs/promises";
import { Logger } from "../utils/Logger";

const readPackageJson = async (filePath: string): Promise<PackageJson> => {
  try {
    const packageJsonFile = await readFile(filePath, "utf-8");
    const packageJson = JSON.parse(packageJsonFile) as PackageJson;

    if (!packageJson?.dependencies && !packageJson?.devDepdencies) {
      throw new Error(
        `package.json file '${filePath}' does not include dependencies or devDependecies`
      );
    }

    return packageJson;
  } catch (e) {
    throw new Error(`Could not load file '${filePath}`);
  }
};

const resolvePackageJsonAsList = (
  { dependencies = {}, devDepdencies = {} }: PackageJson,
  includeDevDepdencies: boolean = false
): string[] => {
  let packages: PackageJsonDependecies = {
    ...dependencies,
  };

  if (includeDevDepdencies) {
    packages = { ...packages, ...devDepdencies };
  }

  return Object.keys(packages)
    .map((packageName) => ({
      packageName,
      packageVersion: packages[packageName],
    }))
    .map(
      ({ packageName, packageVersion }) => `${packageName}@${packageVersion}`
    );
};

export const resolvePackagesFromPackageJson = async (
  packageJsonFilePath: string,
  devDepdencies?: boolean
): Promise<string[]> => {
  if (!packageJsonFilePath) {
    return [];
  }

  try {
    const packageJson = await readPackageJson(packageJsonFilePath);
    return resolvePackageJsonAsList(packageJson, devDepdencies);
  } catch {
    Logger.error(`Failed parsing package.json file '${packageJsonFilePath}'`);

    return [];
  }
};
