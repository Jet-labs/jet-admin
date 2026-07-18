# Listeners

<a id="blue-starhttps-jet-labsatlassiannet-wiki-s-974593021-6452-9ceafe429056077b7b7258df893d02468b8922ed-_-images-icons-emoticons-72-1f442png-listener-module-overview"></a>

 Listener Module Overview

The **Listener Module** allows users to listen, subscribe to, or watch data from configured Data Sources.

<a id="pipeline-data-processing-pipeline"></a>

### Data Processing Pipeline

Data received through listeners goes through a data pipeline, where the following steps can be added:

- Pre-processing transformations (in JS)
- Post-processing steps, such as:
  - Triggering Data queries
  - Triggering Workflows
  - Pushing live data to any widget

<a id="contentemoticonpagehttps-jet-labsatlassiannet-wiki-s-974593021-6452-9ceafe429056077b7b7258df893d02468b8922ed-_-images-icons-emoticons-72-1f4c3png-create-a-listener"></a>

# Create a Listener

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