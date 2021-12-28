export interface CommandLineOptions {
  packages: string[];
  devDeps?: boolean;
  peerDeps?: boolean;
  output: string;
}