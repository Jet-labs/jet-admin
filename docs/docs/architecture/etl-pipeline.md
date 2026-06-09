---
id: etl-pipeline
title: ETL Pipeline Module
sidebar_label: ETL Pipeline
sidebar_position: 8
description: Architecture of the Extract-Transform-Load (ETL) pipeline module.
---

# ETL Pipeline Module

While the Workflow Engine is designed for operational logic and state orchestration, Jet Admin includes specialized infrastructure for moving and shaping high-volume data: the **ETL Pipeline Module**.

*[VERIFY: Note that Jet Admin heavily utilizes Listeners (`tblListeners`) for incoming event ingestion, and Workflows for orchestration. True standalone "ETL Pipelines" distinct from Listeners/Workflows might be integrated differently depending on exact platform configuration. The below describes the conceptual model of data transformation within Jet Admin's backend capabilities.]*

## ETL Concepts

An ETL pipeline serves a distinct purpose compared to a Workflow:
- **Workflows:** Best for "If user is created, send email, wait 3 days, send follow-up."
- **ETL Pipelines:** Best for "Extract 10,000 rows from Postgres, map column names to a new schema, and load them into BigQuery."

Jet Admin handles incoming data streams (like Webhooks or Kafka messages) using the **Listener** module. The data is buffered in `tblListenerEvents` and can be processed sequentially.

## Architecture

Data processing in Jet Admin generally follows the Extract → Transform → Load execution model.

1. **Extract (Listeners & Queries):** Data is extracted from external sources. For streaming or event-based data, Listeners capture events and write them to a buffer table (`tblListenerEvents`). For batch data, queries fetch datasets from databases.
2. **Transform (JavaScript VMs):** Using the isolated `isolated-vm` environment, Jet Admin executes user-defined JavaScript to filter, map, and aggregate the data.
3. **Load (Datasource Integration):** The transformed data is dispatched via the Integration Fabric to a sink (e.g., executing an `insert` query against a data warehouse).

### Event Buffering Strategy
To handle bursts of incoming data (e.g., a massive influx of webhooks), the Listener module buffers events in `tblListenerEvents`. Background workers process these events at a controlled rate, transforming them and pushing them to their destinations, ensuring the system is not overwhelmed.

## Pipeline Configuration

Data pipelines are configured by linking Listeners to target actions.

### Schema
In the database, a pipeline utilizes:
- `tblListeners`: Defines the source (e.g., listening to a specific Postgres table or Kafka topic).
- `tblListenerActions`: Defines what happens when an event is received (e.g., trigger a workflow, execute a query).

### Monitoring
Because events are buffered, developers can query `tblListenerEvents` to monitor pipeline runs, view raw payloads, and track processing status or errors. Failed events are routed to a Dead Letter Queue (`tblEventDLQ`) for inspection and retry.
