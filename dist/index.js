"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudSchedulerManager = void 0;
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const cloudSchedulerManager = () => {
    const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
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
exports.cloudSchedulerManager = cloudSchedulerManager;
