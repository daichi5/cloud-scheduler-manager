import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CloudSchedulerManager } from './cloud-scheduler-manager';

export const cloudSchedulerManager = async (): Promise<void> => {
  const argv = await yargs(hideBin(process.argv))
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
    .option('credentials', {
      type: 'string',
      describe: 'path to GCP credential file',
      demandOption: false,
    })
    .demandCommand(1, 1)
    .strictCommands()
    .strictOptions()
    .help().argv;

  const credential = getCredential(
    argv.credentials,
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );

  const client = new CloudSchedulerManager(
    credential,
    argv.projectId,
    argv.region
  );

  switch (argv._[0]) {
    case 'update':
      await client.update();
      break;

    default:
      throw new Error('unknown command.');
  }
};

function getCredential(
  argCred: string | undefined = '',
  envCred: string | undefined = ''
): string {
  if (!argCred && !envCred) {
    throw new Error('could not find credential file.');
  }

  return argCred || envCred;
}
