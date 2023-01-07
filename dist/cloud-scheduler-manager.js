"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudSchedulerManager = void 0;
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
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
        const config = this.#getConfig(configPath);
        console.log(config);
    }
    #getConfig(configPath) {
        return (0, js_yaml_1.load)((0, fs_1.readFileSync)(configPath, 'utf8'));
    }
}
exports.CloudSchedulerManager = CloudSchedulerManager;
