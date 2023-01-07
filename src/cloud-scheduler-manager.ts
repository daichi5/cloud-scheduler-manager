import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { validate } from 'node-cron';
import { CloudSchedulerClient } from '@google-cloud/scheduler';

type JobConfig = {
  name: string;
  schedule: string;
};

type JobsConfig = {
  jobs: JobConfig[];
};

class CloudSchedulerManager {
  private client: CloudSchedulerClient;
  private projectId: string;
  private region: string;

  constructor(keyFilename: string, projectId: string, region: string) {
    this.client = new CloudSchedulerClient({ keyFilename });
    this.projectId = projectId;
    this.region = region;
  }

  async update(configPath: string): Promise<void> {
    const config = this.#getConfig(configPath);
    console.log(config);
  }

  #getConfig(configPath: string): JobsConfig {
    const config = load(readFileSync(configPath, 'utf8')) as JobsConfig;

    for (const job of config.jobs) {
      if (!validate(job.schedule))
        throw new Error(`invalid schedule format: ${job.schedule}`);
    }

    return config;
  }
}
export { CloudSchedulerManager };
