# Data Query

<a id="blue-starhttps-jet-labsatlassiannet-wiki-s-974593021-6452-9ceafe429056077b7b7258df893d02468b8922ed-_-images-icons-emoticons-72-1f50dpng-data-query-module-overview"></a>

## Data Query Module Overview

The **Data Query Module** lets users write and run queries or supported commands on configured Data Sources. Data Queries perform CRUD operations on any supported data source.

<a id="contentemoticonpagehttps-jet-labsatlassiannet-wiki-s-974593021-6452-9ceafe429056077b7b7258df893d02468b8922ed-_-images-icons-emoticons-72-1f4c3png-create-a-data-query"></a>

## Create a Data Query

1. Click on the Queries Tab
2. Click on Add query button in the right hand side drawer list

![image-20260617-120738.png](./attachments/image-20260617-120738.png)

1. A query configuration form will appear
2. Select your configured data source
3. Dynamic fields will appear in the form which are supported by the data source
4. Once all the details are filled, you can click on test to test your query

![image-20260618-100048.png](./attachments/image-20260618-100048.png)

<a id="memo-query-variable-usage"></a>

## Query Variable Usage

- Queries support moustache format based variable usage.
- Add all the variables which you want in the Args section.
  - Use the `{{inputs.variable}}` format to reference that variable anywhere in the query config (excluding title and description).

![image-20260618-095852.png](./attachments/image-20260618-095852.png)