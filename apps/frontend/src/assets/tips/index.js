export const query_variable_usage_tip = `
## **Using queries variables**
---------------------------
\\
**Referencing queries inside other queries:** Query values can be used in run-time inside another query by utilizing the syntax below:
\`\`\`sql
select * from city where city_id={{[pm_query_id:21][0].city_id]};
\`\`\`
  - \`{{}}\` is used to utilize the variable
  - \`[]\` is used to define the \`pm_query_id\` of desired query

**Using app constants inside query** (Beta stage!)
\`\`\`sql
select * from city where city_id={{[pm_query_id:22][[pm_query_id:35][0].city_id].city_id}}
or city_id={{[pm_app_constant_id:4].value}};
\`\`\`
`;

export const app_constant_usage_tip = `
## **App constants**
-------------
App constants are constants which contain JSON values and can be used for various purposes. There are two type of app constants, Internal and Global.

Internal app constants are used for declaring constants utlized by Jet Admin while Global app constants can be used in Query objects.

Below are the some app constants
- [x] CUSTOM_INT_VIEW_MAPPING : Used to render custom mapping for integer values of table column while viewing. Syntax of \`CUSTOM_INT_VIEW_MAPPING\` is:
      
    \`\`\`json
    {
        table_name: {
            column_name: {
                int_value1:label1,
                int_value2:label2,
                int_value3:label3,
                ...
            }
        }
    }
    \`\`\`
    For example
    \`\`\`json
    {
        "restaurant_menu": {
            "item_id": {
                "1":"Tea",
                "23":"Coffee",
                "34":"Hot chocholate",
                ...
            }
        }
    }
    \`\`\`
- [x] CUSTOM_INT_EDIT_MAPPING : Used to render custom mapping for integer values of table column while editing a row. Syntax of \`CUSTOM_INT_EDIT_MAPPING\` is same as \`CUSTOM_INT_VIEW_MAPPING\`.
- [x] APP_NAME : Used to declare custom application name:
    \`\`\`json
    {
        "value":"Super food store admin"
    }
    \`\`\`
`;

export const cron_job_usage_tip = `
##### **Cron Syntax Quick Reference**

| Schedule | Cron Expression | Description |
|---|---|---|
| Daily at Midnight | \`0 0 * * *\` | Runs the command every day at midnight (12:00 AM). |
| Every Hour | \`0 * * * *\` | Runs the command at the beginning of every hour. |
| Monday at 3 PM | \`0 15 * * 1\` | Runs the command every Monday at 3:00 PM. |
| Every 15 Minutes | \`*/15 * * * *\` | Runs the command every 15 minutes.  |
| First Day of Every Month at 5 AM | \`0 5 1 * *\` | Runs the command on the 1st of every month at 5:00 AM. |

##### **Fields**
- **Minute**: \`0-59\`
- **Hour**: \`0-23\`
- **Day**: \`1-31\`
- **Month**: \`1-12\`
- **Day of Week**: \`0-7\` (0 & 7 are Sunday)

##### **Special Characters**
- **\`*\`**: Every
- **\`,\`**: Multiple
- **\`-\`**: Range
- **\`/\`**: Increment
`;