declare class CloudSchedulerManager {
    #private;
    private client;
    private projectId;
    private region;
    constructor(keyFilename: string, projectId: string, region: string);
    update(configPath: string): Promise<void>;
    create(configPath: string): Promise<void>;
    prune(configPath: string): Promise<void>;
    sync(configPath: string): Promise<void>;
}
export { CloudSchedulerManager };
//# sourceMappingURL=cloud-scheduler-manager.d.ts.map