"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudSchedulerManager = void 0;
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
    async update() {
        console.log('update');
    }
}
exports.CloudSchedulerManager = CloudSchedulerManager;
