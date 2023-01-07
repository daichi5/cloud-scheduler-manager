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
  jobInfo: protos.google.cloud.scheduler.v1.IJob | null,
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
      if (!jobInfo) {
        throw new Error(
          `job not found: ${this.client.jobPath(
            this.projectId,
            this.region,
            jobConfig.name
          )}`
        );
      }

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

  async create(configPath: string): Promise<void> {
    const config = this.#getConfig(configPath);

    await this.#applyAction(config, async (jobInfo, jobConfig) => {
      if (jobInfo) {
        console.log('job already exists: ', jobInfo.name);
        return;
      }

      console.log('creating job: ', jobConfig.name);

      await this.client.createJob({
        parent: this.client.locationPath(this.projectId, this.region),
        job: {
          name: this.client.jobPath(
            this.projectId,
            this.region,
            jobConfig.name
          ),
          schedule: jobConfig.schedule,
          description: jobConfig.description,
          timeZone: jobConfig.time_zone,
        },
      });
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
        .then((res) => res[0])
        .catch(() => null);

      console.log(jobInfo);

      action(jobInfo, jobConfig);
    }
  }
}
export { CloudSchedulerManager };
