# @bokovza/package-downloader - NPM Package Downloader
## Made with ❤️ by [Bar Yochai Bokovza](https://twitter.com/bar_boko) ([Buy me a ☕️](https://www.buymeacoffee.com/barboko))

## Main Features
- You can download **multiple packages with dependencies**
  - The resolver will merge the entire dependency tree, for reducing the amount of packages to download
- **The resolver uses [`pacote`](https://www.npmjs.com/package/pacote)**, which means that the same resolver of npm, used in this package downloader
- **Skipping downloaded packages**, in case of running again the package downloader with different packages on the same output directory

## Usage
### Install
```bash
$ npm i -g @bokovza/package-downloader
```

### Run
```bash
$ packageDownloader -p "react react-router-dom" -o "whiten"
```
This example will download packages `react` and `react-router-dom` with all of the dependencies to `./whiten` directory.

## Options
### Mandatory
#### Packages - `-p` or `--packages`
- List of packages divided by spaces
- Must be inside `"___"`
- Write the name of the packages the same way you write when you run the command `npm install`

#### Output - `-o` or `--output`
- Target Directory of the downloading
- Must to write the name of the directory (even if it not exists) after the flag.

### Optional
#### Dev Dependencies - `-d` or `--devDeps`
- Boolean flag
- If `true`, also download dev dependencies

#### Peer Dependencies - `-e` or `--peerDeps`
- Boolean flag
- If `true`, also download peer dependencies

#### Throttle Limit - `-l` or `--limit`
- Positive Number flag
- Sets the amount of parallel downloads to run
- Default: 10