import { CloudSchedulerClient } from '@google-cloud/scheduler';

class CloudSchedulerManager {
  private client: CloudSchedulerClient;
  private projectId: string;
  private region: string;

  constructor(keyFilename: string, projectId: string, region: string) {
    this.client = new CloudSchedulerClient({ keyFilename });
    this.projectId = projectId;
    this.region = region;
  }

  async update(): Promise<void> {
    console.log('update');
  }
}
export { CloudSchedulerManager };
