import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { validate } from 'node-cron';
import { CloudSchedulerClient } from '@google-cloud/scheduler';
class A {
    value;
    constructor(value) {
        this.value = value;
    }
}
class CloudSchedulerManager {
    client;
    projectId;
    region;
    constructor(keyFilename, projectId, region) {
        this.client = new CloudSchedulerClient({ keyFilename });
        this.projectId = projectId;
        this.region = region;
    }
    async update(configPath) {
        const config = this.getConfig(configPath);
        await this.#applyAction(config, async (jobInfo, jobConfig) => {
            if (!jobInfo) {
                throw new Error(`job not found: ${this.client.jobPath(this.projectId, this.region, jobConfig.name)}`);
            }
            console.log('updating job: ', jobInfo.name);
            await this.client.updateJob({
                job: {
                    name: jobInfo.name,
                    schedule: jobConfig.schedule,
                    description: jobConfig.description ?? jobInfo.description,
                    timeZone: jobConfig.timeZone ?? jobInfo.timeZone,
                },
                updateMask: { paths: ['schedule', 'description', 'time_zone'] },
            });
            console.log('updated job: ', jobInfo.name);
        });
    }
    async create(configPath) {
        const config = this.getConfig(configPath);
        await this.#applyAction(config, async (jobInfo, jobConfig) => {
            if (jobInfo) {
                console.log('job already exists: ', jobInfo.name);
                return;
            }
            console.log('creating job: ', jobConfig.name);
            await this.client.createJob({
                parent: this.client.locationPath(this.projectId, this.region),
                job: {
                    ...jobConfig,
                    name: this.client.jobPath(this.projectId, this.region, jobConfig.name),
                },
            });
            console.log('created job: ', jobConfig.name);
        });
    }
    async prune(configPath) {
        const config = this.getConfig(configPath);
        const jobList = await this.client
            .listJobs({
            parent: this.client.locationPath(this.projectId, this.region),
        })
            .then((res) => res[0]);
        for (const job of jobList) {
            if (!job.name) {
                continue;
            }
            const existsJob = config.jobs.find((j) => {
                const jobPath = this.client.jobPath(this.projectId, this.region, j.name);
                return jobPath === job.name;
            });
            if (existsJob) {
                continue;
            }
            if (job.name.match(config.prune.target.name.regexp)) {
                console.log('deleting job: ', job.name);
                await this.client.deleteJob({ name: job.name });
                console.log('deleted job: ', job.name);
            }
        }
    }
    async sync(configPath) {
        await this.prune(configPath);
        await this.create(configPath);
        await this.update(configPath);
    }
    getConfig(configPath) {
        const config = load(readFileSync(configPath, 'utf8'));
        for (const job of config.jobs) {
            if (!validate(job.schedule))
                throw new Error(`invalid schedule format: ${job.schedule}`);
        }
        return config;
    }
    async #applyAction(config, action) {
        for (const job of config.jobs) {
            const jobConfig = { ...config.common, ...job };
            const jobPath = this.client.jobPath(this.projectId, this.region, jobConfig.name);
            const jobInfo = await this.client
                .getJob({ name: jobPath })
                .then((res) => res[0])
                .catch(() => null);
            await action(jobInfo, jobConfig);
        }
    }
}
export { CloudSchedulerManager };
