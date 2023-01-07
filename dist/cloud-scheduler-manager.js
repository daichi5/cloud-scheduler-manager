"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudSchedulerManager = void 0;
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const node_cron_1 = require("node-cron");
const scheduler_1 = require("@google-cloud/scheduler");
class CloudSchedulerManager {
    client;
    projectId;
    region;
    constructor(keyFilename, projectId, region) {
        this.client = new scheduler_1.CloudSchedulerClient({ keyFilename });
        this.projectId = projectId;
        this.region = region;
    }
    async update(configPath) {
        const info = await this.client.listJobs({
            parent: this.client.locationPath(this.projectId, this.region),
        });
        console.log(info);
        const config = this.#getConfig(configPath);
        for (const job of config.jobs) {
            const jobConfig = { ...config.common, ...job };
            const jobPath = this.client.jobPath(this.projectId, this.region, jobConfig.name);
            const jobInfo = await this.client
                .getJob({ name: jobPath })
                .then((res) => res[0]);
            if (!jobInfo) {
                console.log('job not found: ', jobPath);
            }
            console.log('updating job: ', jobPath);
            await this.client.updateJob({
                job: {
                    name: jobPath,
                    schedule: jobConfig.schedule,
                    description: jobConfig.description ?? jobInfo.description,
                    timeZone: jobConfig.time_zone ?? jobInfo.timeZone,
                },
                updateMask: { paths: ['schedule', 'description', 'time_zone'] },
            });
            console.log('updated job: ', jobPath);
        }
    }
    #getConfig(configPath) {
        const config = (0, js_yaml_1.load)((0, fs_1.readFileSync)(configPath, 'utf8'));
        for (const job of config.jobs) {
            if (!(0, node_cron_1.validate)(job.schedule))
                throw new Error(`invalid schedule format: ${job.schedule}`);
        }
        return config;
    }
}
exports.CloudSchedulerManager = CloudSchedulerManager;
