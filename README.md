# Cloud Scheduler Manager

The cloud-scheduler-manager module is a CloudScheduler client wrapper, which is useful to manage using config files.
This can be used as a CLI, or as object in your application.

## Installing

Using npm:

```bash
npm install cloud-scheduler-manager
```

## Setup

create config.yaml as follows

```yaml
jobs:
  - name: app-job1-name
    schedule: '* * * * *'
    description: 'description text'
  - name: app-job2-name
    schedule: '*/15 * * * *'
    timeZone: 'Asia/Tokyo'
common:
  timeZone: 'Europe/London'
prune:
  target:
    name:
      regexp: 'app-.*'
```

## Usage

### CLI

```bash
export GOOGLE_APPLICATION_CREDENTIALS=./path/to/cred_file
npx cloud-scheduler-manager create \
--projectId sample \
--region us-central1 \
--config config.yaml
```

You can also use `--credentials` option instead of `GOOGLE_APPLICATION_CREDENTIALS` env.

```bash
npx cloud-scheduler-manager create \
--projectId sample \
--region us-central1 \
--config config.yaml \
--credentials ./path/to/cred_file
```

and you can use `update, prune, sync` sub commands.
For a detailed information, please use the `-h` option.
