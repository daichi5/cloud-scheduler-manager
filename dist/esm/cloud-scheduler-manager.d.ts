import { CloudSchedulerClient } from '@google-cloud/scheduler';
declare class CloudSchedulerManager {
    #private;
    client: CloudSchedulerClient;
    projectId: string;
    region: string;
    constructor(keyFilename: string, projectId: string, region: string);
    update(configPath: string): Promise<void>;
    create(configPath: string): Promise<void>;
    prune(configPath: string): Promise<void>;
    sync(configPath: string): Promise<void>;
    private getConfig;
}
export { CloudSchedulerManager };
//# sourceMappingURL=cloud-scheduler-manager.d.ts.map