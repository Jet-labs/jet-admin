var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  DATASOURCE_TYPES: () => DATASOURCE_TYPES
});
module.exports = __toCommonJS(index_exports);

// src/postgresql/formConfig.json
var formConfig_default = {
  schema: {
    type: "object",
    properties: {
      connectionOption: {
        type: "string",
        enum: ["connectionDetails", "connectionString"],
        default: "connectionDetails",
        description: "Choose to enter connection details or a connection string."
      },
      connectionDetails: {
        type: "object",
        properties: {
          connectionName: {
            type: "string",
            description: "A unique name for this data source connection.",
            minLength: 3
          },
          host: {
            type: "string",
            description: "The hostname or IP address of the PostgreSQL server.",
            format: "hostname"
          },
          port: {
            type: "integer",
            description: "The port number of the PostgreSQL server (default is 5432).",
            minimum: 1,
            maximum: 65535,
            default: 5432
          },
          database: {
            type: "string",
            description: "The name of the database to connect to.",
            minLength: 1
          },
          user: {
            type: "string",
            description: "The username for connecting to the database.",
            minLength: 1
          },
          password: {
            type: "string",
            description: "The password for the specified user.",
            format: "password"
          },
          sslMode: {
            type: "string",
            description: "SSL mode for the connection.",
            enum: [
              "disable",
              "allow",
              "prefer",
              "require",
              "verify-ca",
              "verify-full"
            ],
            default: "prefer"
          },
          additionalOptions: {
            type: "object",
            description: "Additional connection options (e.g., timeout, application name).",
            properties: {
              connectTimeout: {
                type: "integer",
                description: "Connection timeout in seconds.",
                minimum: 0
              },
              applicationName: {
                type: "string",
                description: "Application name to be sent to the server."
              }
            },
            additionalProperties: true
          }
        },
        required: ["connectionName", "host", "database", "user", "password"]
      },
      connectionString: {
        type: "string",
        description: "The full PostgreSQL connection string (e.g., 'postgresql://user:password@host:port/database').",
        minLength: 1
      }
    },
    required: ["connectionOption"],
    allOf: [
      {
        if: {
          properties: {
            connectionOption: {
              const: "connectionDetails"
            }
          }
        },
        then: {
          required: ["connectionDetails"]
        }
      },
      {
        if: {
          properties: {
            connectionOption: {
              const: "connectionString"
            }
          }
        },
        then: {
          required: ["connectionString"]
        }
      }
    ]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/connectionOption",
        label: "Connection Type"
      },
      {
        type: "Group",
        label: "Connection Details",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/connectionOption",
            schema: { const: "connectionDetails" }
          }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/connectionName",
                label: "Connection Name"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/host",
                label: "Host"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/port",
                label: "Port"
              }
            ]
          },
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/database",
                label: "Database Name"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/user",
                label: "Username"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/password",
                label: "Password",
                options: {
                  format: "password"
                }
              }
            ]
          },
          {
            type: "Control",
            scope: "#/properties/connectionDetails/properties/sslMode",
            label: "SSL Mode"
          },
          {
            type: "Group",
            label: "Advanced Options",
            elements: [
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/additionalOptions/properties/connectTimeout",
                label: "Connection Timeout (seconds)"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/additionalOptions/properties/applicationName",
                label: "Application Name"
              }
            ]
          }
        ]
      },
      {
        type: "Group",
        label: "Connection String",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/connectionOption",
            schema: { const: "connectionString" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/connectionString",
            label: "Connection String"
          }
        ]
      }
    ]
  },
  data: {
    connectionOption: "connectionDetails",
    connectionDetails: {
      connectionName: "MyDevPostgres",
      host: "localhost",
      port: 5432,
      database: "mydatabase",
      user: "dbuser",
      password: "securepassword",
      sslMode: "prefer",
      additionalOptions: {
        connectTimeout: 10,
        applicationName: "JSONFormsApp"
      }
    },
    connectionString: ""
  }
};

// src/postgresql/queryConfig.json
var queryConfig_default = {
  schema: {
    type: "object",
    properties: {
      queryType: {
        type: "string",
        enum: ["query", "gui"],
        default: "query"
      },
      query: {
        type: "string",
        description: "PostgreSQL code to execute",
        format: "code-pgsql"
      },
      args: {
        type: "array",
        description: "Query arguments",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string"
            },
            type: {
              type: "string",
              enum: [
                "string",
                "number",
                "boolean",
                "array (, separated)",
                "object (JSON stringified)"
              ],
              default: "string"
            }
          },
          required: ["key", "type"]
        }
      }
    },
    required: ["queryType"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/queryType",
        label: "Query Type"
      },
      {
        type: "Group",
        label: "Raw SQL",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/queryType",
            schema: { const: "query" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/query",
            label: "Raw sql"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/args",
        label: "Arguments",
        options: {
          detail: {
            type: "VerticalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/key"
              },
              {
                type: "Control",
                scope: "#/properties/type"
              }
            ]
          }
        }
      }
    ]
  },
  data: {
    queryType: "query",
    query: "SELECT id, name FROM users WHERE active = true;",
    args: [
      { key: "user_id", value: "123" },
      { key: "status", value: "active" }
    ]
  }
};

// src/restapi/formConfig.json
var formConfig_default2 = {
  schema: {
    type: "object",
    properties: {
      baseUrl: {
        type: "string",
        description: "Base URL of the REST API (e.g., https://api.example.com )"
      },
      method: {
        type: "string",
        enum: [
          "GET",
          "POST",
          "PUT",
          "DELETE",
          "PATCH"
        ],
        default: "GET"
      },
      timeout: {
        type: "integer",
        description: "Request timeout in seconds",
        minimum: 1
      },
      authType: {
        type: "string",
        enum: [
          "none",
          "basic",
          "bearer",
          "oauth2"
        ],
        default: "none"
      },
      username: {
        type: "string",
        description: "Username for Basic Auth"
      },
      password: {
        type: "string",
        description: "Password for Basic Auth",
        format: "password"
      },
      bearerToken: {
        type: "string",
        description: "Bearer token for authentication",
        format: "password"
      },
      oauth2: {
        type: "object",
        properties: {
          clientId: {
            type: "string"
          },
          clientSecret: {
            type: "string",
            format: "password"
          },
          tokenUrl: {
            type: "string",
            format: "uri"
          }
        },
        required: [
          "clientId",
          "clientSecret",
          "tokenUrl"
        ]
      },
      headers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string"
            },
            value: {
              type: "string"
            }
          },
          required: [
            "key",
            "value"
          ]
        }
      },
      queryParams: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string"
            },
            value: {
              type: "string"
            }
          },
          required: [
            "key",
            "value"
          ]
        }
      },
      body: {
        type: "string",
        description: "Request body (for POST/PUT/PATCH)"
      },
      contentType: {
        type: "string",
        enum: [
          "application/json",
          "application/xml",
          "text/plain"
        ],
        default: "application/json"
      },
      followRedirects: {
        type: "boolean",
        default: true
      },
      sslVerify: {
        type: "boolean",
        default: true
      }
    },
    required: [
      "baseUrl",
      "method"
    ]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Categorization",
        elements: [
          {
            type: "Category",
            label: "General",
            elements: [
              {
                type: "Control",
                scope: "#/properties/baseUrl"
              },
              {
                type: "Control",
                scope: "#/properties/method"
              },
              {
                type: "Control",
                scope: "#/properties/timeout"
              },
              {
                type: "Control",
                scope: "#/properties/contentType"
              }
            ]
          },
          {
            type: "Category",
            label: "Authentication",
            elements: [
              {
                type: "Control",
                scope: "#/properties/authType"
              },
              {
                type: "Group",
                label: "Basic Auth",
                rule: {
                  effect: "SHOW",
                  condition: {
                    scope: "#/properties/authType",
                    schema: {
                      const: "basic"
                    }
                  }
                },
                elements: [
                  {
                    type: "Control",
                    scope: "#/properties/username"
                  },
                  {
                    type: "Control",
                    scope: "#/properties/password"
                  }
                ]
              },
              {
                type: "Group",
                label: "Bearer Token",
                rule: {
                  effect: "SHOW",
                  condition: {
                    scope: "#/properties/authType",
                    schema: {
                      const: "bearer"
                    }
                  }
                },
                elements: [
                  {
                    type: "Control",
                    scope: "#/properties/bearerToken"
                  }
                ]
              },
              {
                type: "Group",
                label: "OAuth2",
                rule: {
                  effect: "SHOW",
                  condition: {
                    scope: "#/properties/authType",
                    schema: {
                      const: "oauth2"
                    }
                  }
                },
                elements: [
                  {
                    type: "Control",
                    scope: "#/properties/oauth2/properties/clientId"
                  },
                  {
                    type: "Control",
                    scope: "#/properties/oauth2/properties/clientSecret"
                  },
                  {
                    type: "Control",
                    scope: "#/properties/oauth2/properties/tokenUrl"
                  }
                ]
              }
            ]
          },
          {
            type: "Category",
            label: "Headers",
            elements: [
              {
                type: "Control",
                scope: "#/properties/headers",
                options: {
                  detail: {
                    type: "VerticalLayout",
                    elements: [
                      {
                        type: "Control",
                        scope: "#/properties/key"
                      },
                      {
                        type: "Control",
                        scope: "#/properties/value"
                      }
                    ]
                  }
                }
              }
            ]
          },
          {
            type: "Category",
            label: "Query Params",
            elements: [
              {
                type: "Control",
                scope: "#/properties/queryParams",
                options: {
                  detail: {
                    type: "VerticalLayout",
                    elements: [
                      {
                        type: "Control",
                        scope: "#/properties/key"
                      },
                      {
                        type: "Control",
                        scope: "#/properties/value"
                      }
                    ]
                  }
                }
              }
            ]
          },
          {
            type: "Category",
            label: "Body",
            rule: {
              effect: "SHOW",
              condition: {
                scope: "#/properties/method",
                schema: {
                  enum: [
                    "POST",
                    "PUT",
                    "PATCH"
                  ]
                }
              }
            },
            elements: [
              {
                type: "Control",
                scope: "#/properties/body"
              }
            ]
          },
          {
            type: "Category",
            label: "Advanced",
            elements: [
              {
                type: "Control",
                scope: "#/properties/followRedirects"
              },
              {
                type: "Control",
                scope: "#/properties/sslVerify"
              }
            ]
          }
        ]
      }
    ]
  },
  data: {
    baseUrl: "https://api.example.com",
    method: "GET",
    timeout: 10,
    authType: "bearer",
    bearerToken: "your-bearer-token-here",
    headers: [
      {
        key: "X-Custom-Header",
        value: "HeaderValue"
      }
    ],
    queryParams: [
      {
        key: "filter",
        value: "active"
      }
    ],
    contentType: "application/json",
    followRedirects: true,
    sslVerify: true
  }
};

// src/restapi/queryConfig.json
var queryConfig_default2 = {
  schema: {
    type: "object",
    properties: {
      apiEndpoint: {
        type: "string",
        description: "API endpoint to fetch data from baseUrl (e.g., /data)"
      },
      method: {
        type: "string",
        enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        default: "GET"
      },
      timeout: {
        type: "integer",
        description: "Request timeout in seconds",
        minimum: 1
      },
      authType: {
        type: "string",
        enum: ["none", "basic", "bearer", "oauth2"],
        default: "none"
      },
      username: {
        type: "string",
        description: "Username for Basic Auth"
      },
      password: {
        type: "string",
        description: "Password for Basic Auth",
        format: "password"
      },
      bearerToken: {
        type: "string",
        description: "Bearer token for authentication",
        format: "password"
      },
      oauth2: {
        type: "object",
        properties: {
          clientId: { type: "string" },
          clientSecret: { type: "string", format: "password" },
          tokenUrl: { type: "string", format: "uri" }
        },
        required: ["clientId", "clientSecret", "tokenUrl"]
      },
      headers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            value: { type: "string" }
          },
          required: ["key", "value"]
        }
      },
      queryParams: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            value: { type: "string" }
          },
          required: ["key", "value"]
        }
      },
      body: {
        type: "string",
        description: "Request body (for POST/PUT/PATCH)"
      },
      contentType: {
        type: "string",
        enum: ["application/json", "application/xml", "text/plain"],
        default: "application/json"
      },
      followRedirects: {
        type: "boolean",
        default: true
      },
      sslVerify: {
        type: "boolean",
        default: true
      },
      args: {
        type: "array",
        description: "Query arguments",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string"
            },
            type: {
              type: "string",
              enum: [
                "string",
                "number",
                "boolean",
                "array (, separated)",
                "object (JSON stringified)"
              ],
              default: "string"
            }
          },
          required: ["key", "type"]
        }
      }
    },
    required: [
      "apiEndpoint",
      "method"
    ]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Categorization",
        elements: [
          {
            type: "Category",
            label: "General",
            elements: [
              {
                type: "Control",
                scope: "#/properties/apiEndpoint"
              },
              {
                type: "Control",
                scope: "#/properties/method"
              },
              {
                type: "Control",
                scope: "#/properties/timeout"
              },
              {
                type: "Control",
                scope: "#/properties/contentType"
              }
            ]
          },
          {
            type: "Category",
            label: "Authentication",
            elements: [
              {
                type: "Control",
                scope: "#/properties/authType"
              },
              {
                type: "Group",
                label: "Basic Auth",
                rule: {
                  effect: "SHOW",
                  condition: {
                    scope: "#/properties/authType",
                    schema: { const: "basic" }
                  }
                },
                elements: [
                  {
                    type: "Control",
                    scope: "#/properties/username"
                  },
                  {
                    type: "Control",
                    scope: "#/properties/password"
                  }
                ]
              },
              {
                type: "Group",
                label: "Bearer Token",
                rule: {
                  effect: "SHOW",
                  condition: {
                    scope: "#/properties/authType",
                    schema: { const: "bearer" }
                  }
                },
                elements: [
                  {
                    type: "Control",
                    scope: "#/properties/bearerToken"
                  }
                ]
              },
              {
                type: "Group",
                label: "OAuth2",
                rule: {
                  effect: "SHOW",
                  condition: {
                    scope: "#/properties/authType",
                    schema: { const: "oauth2" }
                  }
                },
                elements: [
                  {
                    type: "Control",
                    scope: "#/properties/oauth2/properties/clientId"
                  },
                  {
                    type: "Control",
                    scope: "#/properties/oauth2/properties/clientSecret"
                  },
                  {
                    type: "Control",
                    scope: "#/properties/oauth2/properties/tokenUrl"
                  }
                ]
              }
            ]
          },
          {
            type: "Category",
            label: "Headers",
            elements: [
              {
                type: "Control",
                scope: "#/properties/headers",
                options: {
                  detail: {
                    type: "VerticalLayout",
                    elements: [
                      {
                        type: "Control",
                        scope: "#/properties/key"
                      },
                      {
                        type: "Control",
                        scope: "#/properties/value"
                      }
                    ]
                  }
                }
              }
            ]
          },
          {
            type: "Category",
            label: "Query Params",
            elements: [
              {
                type: "Control",
                scope: "#/properties/queryParams",
                options: {
                  detail: {
                    type: "VerticalLayout",
                    elements: [
                      {
                        type: "Control",
                        scope: "#/properties/key"
                      },
                      {
                        type: "Control",
                        scope: "#/properties/value"
                      }
                    ]
                  }
                }
              }
            ]
          },
          {
            type: "Category",
            label: "Body",
            rule: {
              effect: "SHOW",
              condition: {
                scope: "#/properties/method",
                schema: { enum: ["POST", "PUT", "PATCH"] }
              }
            },
            elements: [
              {
                type: "Control",
                scope: "#/properties/body"
              }
            ]
          },
          {
            type: "Category",
            label: "Advanced",
            elements: [
              {
                type: "Control",
                scope: "#/properties/followRedirects"
              },
              {
                type: "Control",
                scope: "#/properties/sslVerify"
              }
            ]
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/args",
        label: "Arguments",
        options: {
          detail: {
            type: "VerticalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/key"
              },
              {
                type: "Control",
                scope: "#/properties/type"
              }
            ]
          }
        }
      }
    ]
  },
  data: {
    apiEndpoint: "/data ",
    method: "GET",
    timeout: 10,
    authType: "bearer",
    bearerToken: "your-bearer-token-here",
    headers: [{ key: "X-Custom-Header", value: "HeaderValue" }],
    queryParams: [{ key: "filter", value: "active" }],
    contentType: "application/json",
    followRedirects: true,
    sslVerify: true
  }
};

// src/weburl/formConfig.json
var formConfig_default3 = {
  schema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "URL to fetch data from"
      },
      timeout: {
        type: "integer",
        description: "Request timeout in seconds",
        minimum: 1
      }
    },
    required: [
      "url"
    ]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/url",
        label: "URL"
      },
      {
        type: "Control",
        scope: "#/properties/timeout",
        label: "Timeout"
      }
    ]
  },
  data: {
    url: "https://api.example.com/v1/data",
    timeout: 10
  }
};

// src/weburl/queryConfig.json
var queryConfig_default3 = {
  schema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        description: "Action to perform",
        enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        default: "GET"
      },
      args: {
        type: "array",
        description: "Query arguments",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string"
            },
            type: {
              type: "string",
              enum: [
                "string",
                "number",
                "boolean",
                "array (, separated)",
                "object (JSON stringified)"
              ],
              default: "string"
            }
          },
          required: ["key", "type"]
        }
      }
    },
    required: ["action"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/action",
        label: "Action"
      },
      {
        type: "Control",
        scope: "#/properties/args",
        label: "Arguments",
        options: {
          detail: {
            type: "VerticalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/key"
              },
              {
                type: "Control",
                scope: "#/properties/type"
              }
            ]
          }
        }
      }
    ]
  },
  data: {
    action: "GET",
    timeout: 10,
    args: [
      { key: "user_id", value: "123" },
      { key: "status", value: "active" }
    ]
  }
};

// src/index.js
var DATASOURCE_TYPES = {
  POSTGRESQL: {
    name: "PostgreSQL",
    value: "postgresql",
    formConfig: formConfig_default,
    queryConfigForm: queryConfig_default
  },
  MYSQL: {
    name: "MySQL",
    value: "mysql"
  },
  MSSQL: {
    name: "MSSQL",
    value: "mssql"
  },
  RESTAPI: {
    name: "REST API",
    value: "restapi",
    formConfig: formConfig_default2,
    queryConfigForm: queryConfig_default2
  },
  WEB_URL: {
    name: "Web URL",
    value: "weburl",
    formConfig: formConfig_default3,
    queryConfigForm: queryConfig_default3
  }
};
//# sourceMappingURL=index.cjs.map
