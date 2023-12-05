export interface CommandLineOptions {
  packages?: string[];
  devDeps?: boolean;
  peerDeps?: boolean;
  output: string;
  throttleLimit: number;
  flatten?: boolean;
  packageJson?: string;
}

export type PackageJsonDependecies = Record<string, string>;

export interface PackageJson {
  dependencies?: PackageJsonDependecies;
  devDepdencies?: PackageJsonDependecies;
}
