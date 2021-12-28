export interface NpmPackage {
  name: string;
  version: string;
}

export interface NpmPackageManifest extends NpmPackage {
  tarball: string;
  dependencies: NpmPackage[];
}

export type DependencyFlattenTree = {
  [packageName: string]: {
    [version: string]: string
  }
}

export type PackageTarballs = {
  [packageName: string]: string[]
}
