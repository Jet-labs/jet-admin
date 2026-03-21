---
id: cron-jobs
title: Scheduled Automation (Cron Jobs)
sidebar_label: Cron Jobs
sidebar_position: 1
description: Schedule automated tasks and queries in Jet Admin.
---

# Scheduled Automation (Cron Jobs)

![Cron Jobs Demo](/img/placeholder-cron.png)

Jet Admin allows you to schedule queries and automated tasks using a familiar cron syntax. This is useful for generating daily reports, syncing data between systems periodically, or cleaning up temporary data.

## Creating a Scheduled Job

1. Navigate to **Automation** > **Cron Jobs**.
2. Click **Create Job**.
3. Define the **Schedule** using standard cron syntax (e.g., `0 0 * * *` for daily at midnight).
4. Select the **Target Action**: This can be executing a specific Data Query or triggering a Workflow.
5. Save the job to active it.

## Monitoring Job Executions

Every time a cron job runs, an execution log is generated. You can view the success, failure, duration, and output of past executions in the job's history tab.

### API Reference Stub
- `GET /api/v1/tenants/:tenantID/cron-jobs` - List scheduled jobs
- `POST /api/v1/tenants/:tenantID/cron-jobs` - Schedule a new job
