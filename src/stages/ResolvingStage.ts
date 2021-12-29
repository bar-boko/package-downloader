import merge from "deepmerge-json";
import { CommandLineOptions } from "../models/Input";
import { DependencyFlattenTree, NpmPackageManifest } from "../models/Packages";
import { fetchPackageManifest } from "../tools/NpmApi";
import { Logger } from "../utils/Logger";
import { getPackageNameWithVersion } from "../utils/NameUtils";

const addPackageToTree = (tree: DependencyFlattenTree, { name, version, tarball }: NpmPackageManifest) => {
  const resolvedPackage: DependencyFlattenTree = {
    [name]: {
      [version]: tarball,
    }
  };

  return merge(tree, resolvedPackage);
};

const getMissingDependencies = (manifest: NpmPackageManifest, tree: DependencyFlattenTree) => manifest
  ?.dependencies
  ?.filter(({ name, version }) => {
      const packageVersions = tree[name];

      return !packageVersions || Boolean(packageVersions[version]);
  });

const resolvePackage = async (
  packageName: string,
  packagesStack: string[],
  dependenciesTree: DependencyFlattenTree,
  devDeps?: boolean,
): Promise<DependencyFlattenTree> => {
      const manifest = await fetchPackageManifest(packageName, devDeps);
      const missingDependencies = getMissingDependencies(manifest, dependenciesTree)
        .map(getPackageNameWithVersion);
  
      packagesStack.push(...missingDependencies);
      return addPackageToTree(dependenciesTree, manifest);
};

export default async ({packages, devDeps}: CommandLineOptions) => {
  Logger.info('Resolving Stage - Started');

  const packagesStack = [...packages];
  let dependencyTree: DependencyFlattenTree = {};

  while (packagesStack.length) {
    const npmPackageName = packagesStack.pop();

    if (!npmPackageName) {
      continue;
    }   

    try {
      Logger.info(`Resolve Package '${npmPackageName}'`);

      dependencyTree = await resolvePackage(npmPackageName, packagesStack, dependencyTree, devDeps);

      Logger.info(`Successfull Resolving Package '${npmPackageName}'`);
    }
    catch (error) {
      Logger.error(`Error fetching Package '${npmPackageName}'`);
      Logger.error(error);
    }
  }

  Logger.info('Resolving Stage - Finished');

  return dependencyTree;
}