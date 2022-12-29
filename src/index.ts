import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const cloudSchedulerManager = (): void => {
  const argv = yargs(hideBin(process.argv))
    .command('update', 'update Cloud Scheduler settings.')
    .command('create', 'create Cloud Schedulers')
    .option('projectId', {
      type: 'string',
      describe: 'GCP Project ID',
      demandOption: true,
      requiresArg: true,
    })
    .option('region', {
      type: 'string',
      describe: 'GCP Region',
      demandOption: true,
      requiresArg: true,
    })
    .demandCommand(1, 1)
    .strictCommands()
    .strictOptions()
    .help().argv;

  console.log(argv);
};
