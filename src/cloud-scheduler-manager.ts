import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { validate } from 'node-cron';
import { CloudSchedulerClient, protos } from '@google-cloud/scheduler';

type JobConfig = {
  name: string;
  schedule: string;
  description: string | undefined;
  time_zone: string | undefined;
};

type JobsConfig = {
  jobs: JobConfig[];
  common: JobConfig;
};

type Action = (
  jobInfo: protos.google.cloud.scheduler.v1.IJob,
  jobConfig: JobConfig
) => void;

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

    await this.#applyAction(config, async (jobInfo, jobConfig) => {
      console.log('updating job: ', jobInfo.name);

      await this.client.updateJob({
        job: {
          name: jobInfo.name,
          schedule: jobConfig.schedule,
          description: jobConfig.description ?? jobInfo.description,
          timeZone: jobConfig.time_zone ?? jobInfo.timeZone,
        },
        updateMask: { paths: ['schedule', 'description', 'time_zone'] },
      });

      console.log('updated job: ', jobInfo.name);
    });
  }

  #getConfig(configPath: string): JobsConfig {
    const config = load(readFileSync(configPath, 'utf8')) as JobsConfig;

    for (const job of config.jobs) {
      if (!validate(job.schedule))
        throw new Error(`invalid schedule format: ${job.schedule}`);
    }

    return config;
  }

  async #applyAction(config: JobsConfig, action: Action) {
    for (const job of config.jobs) {
      const jobConfig = { ...config.common, ...job };
      const jobPath = this.client.jobPath(
        this.projectId,
        this.region,
        jobConfig.name
      );

      const jobInfo = await this.client
        .getJob({ name: jobPath })
        .then((res) => res[0]);

      if (!jobInfo) {
        console.log('job not found: ', jobPath);
      }

      action(jobInfo, jobConfig);
    }
  }
}
export { CloudSchedulerManager };
