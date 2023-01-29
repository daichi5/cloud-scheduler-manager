"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const cloud_scheduler_manager_1 = require("./cloud-scheduler-manager");
const main = async () => {
    const argv = await (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
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
    const credential = getCredential(argv.credentials, process.env.GOOGLE_APPLICATION_CREDENTIALS);
    dispatchCommand(argv._[0], argv.config, credential, argv.projectId, argv.region);
};
exports.main = main;
async function dispatchCommand(command, config, credential, projectId, region, clientInstance = undefined) {
    const client = clientInstance || new cloud_scheduler_manager_1.CloudSchedulerManager(credential, projectId, region);
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
function getCredential(argCred = '', envCred = '') {
    if (!argCred && !envCred) {
        throw new Error('could not find credential file.');
    }
    return argCred || envCred;
}
