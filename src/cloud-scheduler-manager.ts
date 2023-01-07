import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { validate } from 'node-cron';
import { CloudSchedulerClient, protos } from '@google-cloud/scheduler';

type JobConfig = {
  name: string;
  schedule: string;
  description: string | undefined;
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
    const info = await this.client.listJobs({
      parent: this.client.locationPath(this.projectId, this.region),
    });

    console.log(info);

    const config = this.#getConfig(configPath);

    for (const job of config.jobs) {
      const jobPath = this.client.jobPath(
        this.projectId,
        this.region,
        job.name
      );

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
          schedule: job.schedule,
          description: job.description ?? jobInfo.description,
        },
        updateMask: { paths: ['schedule', 'description'] },
      });

      console.log('updated job: ', jobPath);
    }
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
