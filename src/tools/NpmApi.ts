import { keys } from 'ramda';
import pacote from 'pacote';
import { NpmPackage, NpmPackageManifest } from '../models/Packages';

const parseDependencies = (dependencies: Record<string, string>): NpmPackage[] => keys(dependencies)
  .map(packageName => ({
    name: packageName,
    version: dependencies[packageName],
  }));

export const fetchPackageManifest = async (packageName: string, devDeps?: boolean): Promise<NpmPackageManifest> => {
  try {
    const manifest = await pacote.manifest(packageName);
    const dependencies: Record<string, string> = {
      ...manifest.dependencies,
      ...(devDeps ? manifest.devDependencies : {}),
    };

    const result: NpmPackageManifest = {
      name: manifest.name,
      version: manifest.version,
      tarball: manifest.dist.tarball,
      dependencies: parseDependencies(dependencies),
    };

    return result;
  }
  catch (error) {
    throw error;
  }
};