import merge from "deepmerge-json";
import { has, hasPath, partition, uniq } from "ramda";
import { CommandLineOptions } from "../models/Input";
import {
  DependencyFlattenTree,
  NpmPackage,
  NpmPackageManifest,
} from "../models/Packages";
import { fetchPackageManifest } from "../tools/NpmApi";
import { Logger } from "../utils/Logger";
import { getPackageNameWithVersion } from "../utils/NameUtils";
import { resolvePackagesFromPackageJson } from "../tools/PackageJsonResolver";

const addPackageToTree = (
  tree: DependencyFlattenTree,
  { name, version, tarball }: NpmPackageManifest
) => {
  const resolvedPackage: DependencyFlattenTree = {
    [name]: {
      [version]: tarball,
    },
  };

  return merge(tree, resolvedPackage);
};

const isPackageResolved = (
  { name, version }: NpmPackage,
  tree: DependencyFlattenTree
): boolean => hasPath([name, version], tree);

const getMissingDependencies = (
  manifest: NpmPackageManifest,
  tree: DependencyFlattenTree
) => {
  const condition = (dependencyPackage: NpmPackage) =>
    isPackageResolved(dependencyPackage, tree);
  const [existingDependencies, missingDependenciess] = partition(
    condition,
    manifest?.dependencies ?? []
  );

  existingDependencies.forEach(({ name, version }) =>
    Logger.warn(`Skipping    - Package '${name}@${version}' already exists`)
  );

  return missingDependenciess;
};

const resolvePackage = async (
  packageName: string,
  packagesStack: string[],
  dependenciesTree: DependencyFlattenTree,
  devDeps?: boolean
): Promise<DependencyFlattenTree> => {
  const manifest = await fetchPackageManifest(packageName, devDeps);
  const missingDependencies = getMissingDependencies(
    manifest,
    dependenciesTree
  ).map(getPackageNameWithVersion);

  packagesStack.push(...missingDependencies);

  return addPackageToTree(dependenciesTree, manifest);
};

export default async ({
  packages,
  packageJson,
  devDeps,
}: CommandLineOptions) => {
  Logger.info("=================================");
  Logger.info("Resolving Stage -         Started");
  Logger.info("=================================");

  let packagesStack = [...(packages ?? [])];

  if (packageJson) {
    Logger.info(`Trying resolving package.json '${packageJson}`);

    const packageJsonPackages = await resolvePackagesFromPackageJson(
      packageJson,
      devDeps
    );
    Logger.info(
      `Succeed getting ${packageJsonPackages.length} packages from package.json`
    );

    packagesStack = [...packagesStack, ...packageJsonPackages];
  }

  if (!packagesStack.length) {
    Logger.error("No packages found for downloading");
  }

  const resolvedPackages: { [packageName: string]: boolean } = {};
  let dependencyTree: DependencyFlattenTree = {};

  while (packagesStack.length) {
    const npmPackageName = packagesStack.pop();

    if (!npmPackageName) {
      Logger.warn("Skipping    - Empty Package");
      continue;
    }

    if (has(npmPackageName, resolvedPackages)) {
      Logger.warn(`Skipping    - Package '${npmPackageName}' already resolved`);
      continue;
    }

    try {
      Logger.info(`Resolving   - ${npmPackageName}`);

      dependencyTree = await resolvePackage(
        npmPackageName,
        packagesStack,
        dependencyTree,
        devDeps
      );
      packagesStack = uniq(packagesStack);
      Object.assign(resolvedPackages, { [npmPackageName]: true });

      Logger.info(`Resolved :) - ${npmPackageName}`);
    } catch (error) {
      Logger.error(`Error :(    - Fetching Package '${npmPackageName}'`);
      Logger.error(error);
    }
  }

  Logger.info("=================================");
  Logger.info("Resolving Stage -        Finished");
  Logger.info("=================================");

  return dependencyTree;
};
