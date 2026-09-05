---
title: Listeners
description: Event ingestion from data sources — endpoint config, pipeline transforms, and actions.
sidebar_position: 5
---

# Listeners

## Listener Module Overview

The **Listener Module** allows users to listen, subscribe to, or watch data from configured Data Sources.

:::note
Each listener is bound to one datasource (`datasourceID NOT NULL`) and exposes a unique `endpointPath` per tenant. Webhook ingress is `ALL /webhooks/v1/inbound/:tenantID/:pathSuffix` and `/webhooks/v1/inbound/:listenerID` (open CORS, no tenant auth — the path suffix is the secret). Runtime fan-out is Socket.IO rooms `listener:<id>` / `tenant:<id>`.
:::

### Data Processing Pipeline

Data received through listeners goes through a data pipeline, where the following steps can be added:

- Pre-processing transformations (in JS)
- Post-processing steps, such as:
  - Triggering Data queries
  - Triggering Workflows
  - Pushing live data to any widget

<a id="contentemoticonpagehttps-jet-labsatlassiannet-wiki-s-974593021-6452-9ceafe429056077b7b7258df893d02468b8922ed-_-images-icons-emoticons-72-1f4c3png-create-a-listener"></a>

# Create a listener

<a id="contentemoticoncoghttps-jet-labsatlassiannet-wiki-s-974593021-6452-9ceafe429056077b7b7258df893d02468b8922ed-_-images-icons-emoticons-72-2699png-listener-configuration"></a>

 Listener Configuration

1. Click on the Listeners Tab
2. Click on Add listener button in the right hand side drawer list

![image-20260618-095050.png](./attachments/image-20260618-095050.png)

<a id="contentemoticoncoghttps-jet-labsatlassiannet-wiki-s-974593021-6452-9ceafe429056077b7b7258df893d02468b8922ed-_-images-icons-emoticons-72-2699png-listener-configuration-steps"></a>

 Listener Configuration Steps

1. A listener configuration form will appear.
2. Select your configured data source.
3. Listener fields will appear in the form which are supported by the data source.
4. Once all the details are filled, you can click on test to test your query. If your data source is active and sending data, they will appear in console.

![image-20260618-095123.png](./attachments/image-20260618-095123.png)

<a id="contentemoticoncoghttps-jet-labsatlassiannet-wiki-s-974593021-6452-9ceafe429056077b7b7258df893d02468b8922ed-_-images-icons-emoticons-72-2699png-pipeline-configuration-steps"></a>

 Pipeline Configuration Steps

1. Once the listener is configured, you can configure post-ingestion actions & transformations also in the pipeline tab

![image-20260618-095153.png](./attachments/image-20260618-095153.png)

<a id="contentemoticoncoghttps-jet-labsatlassiannet-wiki-s-974593021-6452-9ceafe429056077b7b7258df893d02468b8922ed-_-images-icons-emoticons-72-2699png-blue-starhttps-jet-labsatlassiannet-wiki-s-974593021-6452-9ceafe429056077b7b7258df893d02468b8922ed-_-images-icons-emoticons-72-2699png-sample-configuration-to-push-data-to-app-page"></a>

 Sample Configuration to Push Data to App Page

This sample configuration demonstrates how to push data to a app page in real-time

![image-20260619-063401.png](./attachments/image-20260619-063401.png)

<a id="blue-starhttps-jet-labsatlassiannet-wiki-s-974593021-6452-9ceafe429056077b7b7258df893d02468b8922ed-_-images-icons-emoticons-72-2699png-sample-config-to-trigger-workflow"></a>

 Sample Config to Trigger Workflow

This configuration snippet demonstrates how to trigger a workflow.

![image-20260619-063505.png](./attachments/image-20260619-063505.png)

## Endpoints

Mounted at `/api/v1/tenants/:tenantID/listeners`:

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/status/connections` | `listener.list` | engine connection health |
| GET | `/schemas` | `listener.list` | per-datasource listener config schemas |
| GET | `/` | `listener.list` | list (supports `?folderID=`) |
| POST | `/` | `listener.create` | create; grants creator access |
| GET | `/:listenerID/export` | `listener.read` | export single listener as bundle item |
| POST | `/:listenerID/clone` | `listener.create` | deep copy with fresh ID |
| POST | `/:listenerID/activate`, `/:listenerID/deactivate` | `listener.update` | start/stop ingestion |
| GET \| PUT \| DELETE | `/:listenerID` | `listener.read/update/delete` | CRUD on one listener |
| POST \| PUT \| DELETE | `/:listenerID/actions[/:actionID]` | `listener.update` | pipeline actions: trigger query/workflow, push to widget |

## Runtime

- `startAllListeners()` runs at boot (`config/startup.js`); events flow through the in-process `fastq` queue `listener.events` (+ `.dlq`), consumed by `pipelineWorker`. Pre-processing transforms run in `isolated-vm`.
- Live delivery is Socket.IO (`join_room`/`leave_room` on `listener:<id>`); app pages subscribe per listener data source. Test consoles use `VITE_WEBHOOK_PORT` (default 8095) for the displayed URL — see [Configuration Reference](../operations/configuration-reference.md).