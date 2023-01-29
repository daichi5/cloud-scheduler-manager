import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CloudSchedulerManager } from './cloud-scheduler-manager';

export const main = async (): Promise<void> => {
  const argv = await yargs(hideBin(process.argv))
    .command('update', 'update Cloud Scheduler settings.')
    .command('create', 'create Cloud Schedulers')
    .command('prune', 'prune Cloud Schedulers that are not defined in config.')
    .command('sync', 'prune, create, update Cloud Schedulers.')
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
    .option('config', {
      type: 'string',
      describe: 'path to config file',
      demandOption: true,
      requiresArg: true,
    })
    .demandCommand(1, 1)
    .strictCommands()
    .strictOptions()
    .help().argv;

  const credential = getCredential(
    argv.credentials,
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );

  dispatchCommand(
    argv._[0],
    argv.config,
    credential,
    argv.projectId,
    argv.region
  );
};

async function dispatchCommand(
  command: string | number,
  config: string,
  credential: string,
  projectId: string,
  region: string,
  clientInstance: CloudSchedulerManager | undefined = undefined
): Promise<Promise<Promise<Promise<void>>>> {
  const client =
    clientInstance || new CloudSchedulerManager(credential, projectId, region);

  if (config)
    switch (command) {
      case 'update':
        await client.update(config);
        break;

      case 'create':
        await client.create(config);
        break;

      case 'prune':
        await client.prune(config);
        break;

      case 'sync':
        await client.sync(config);
        break;

      default:
        throw new Error('unknown command.');
    }
}

function getCredential(
  argCred: string | undefined = '',
  envCred: string | undefined = ''
): string {
  if (!argCred && !envCred) {
    throw new Error('could not find credential file.');
  }

  return argCred || envCred;
}
