import { keys } from 'ramda';
import pacote from 'pacote';
import { NpmPackage, NpmPackageManifest } from '../models/Packages';

const parseDependencies = (dependencies: Record<string, string>): NpmPackage[] => keys(dependencies)
  .map(packageName => ({
    name: packageName,
    version: dependencies[packageName],
  }));

export const fetchPackageManifest = async (packageName: string, devDeps?: boolean): Promise<NpmPackageManifest> => {
  const manifest = await pacote.manifest(packageName);
  const { name, version, dist: { tarball }} = manifest;
  
  const dependencies: Record<string, string> = {
    ...manifest.dependencies,
    ...(devDeps ? manifest.devDependencies : {}),
  };

  return {
    name,
    version,
    tarball,
    dependencies: parseDependencies(dependencies),
  };
};