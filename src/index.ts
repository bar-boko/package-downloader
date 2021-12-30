#!/usr/bin/env node

import { Logger } from './utils/Logger';
import { createCommand } from './tools/CommandLine';
import ResolvingStage from './stages/ResolvingStage';
import DownloadingStage from './stages/DownloadingStage';

const options = createCommand();

const app = async () => {
  try {
    const dependencyTree = await ResolvingStage(options);

    console.log(dependencyTree);
    
    await DownloadingStage(options.output, dependencyTree);
  }
  catch (error) {
    Logger.error(error);
  }
  finally {
    Logger.info('Done :)');
    process.exit();
  }
};

app();