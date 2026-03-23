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
                "array",
                "object"
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
          },
          typeOptions: {
            enumLabels: {
              string: "String",
              number: "Number",
              boolean: "Boolean",
              array: "Array",
              object: "Object (JSON)"
            }
          }
        }
      }
    ]
  },
  data: {
    queryType: "query",
    query: "SELECT id, name FROM users WHERE active = true;",
    args: [
      {
        key: "user_id",
        type: "string"
      },
      {
        key: "status",
        type: "string"
      }
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
      "baseUrl"
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
                "array",
                "object"
              ],
              default: "string"
            }
          },
          required: ["key", "type"]
        }
      },
      contentType: {
        type: "string",
        enum: [
          "application/json",
          "application/xml",
          "text/plain"
        ],
        default: "application/json"
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
                scope: "#/properties/contentType"
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
          },
          typeOptions: {
            enumLabels: {
              string: "String",
              number: "Number",
              boolean: "Boolean",
              array: "Array",
              object: "Object (JSON)"
            }
          }
        }
      }
    ]
  },
  data: {
    apiEndpoint: "/data",
    method: "GET",
    headers: [{ key: "X-Custom-Header", value: "HeaderValue" }],
    queryParams: [
      {
        key: "filter",
        value: "active"
      }
    ]
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
                "array",
                "object"
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
          },
          typeOptions: {
            enumLabels: {
              string: "String",
              number: "Number",
              boolean: "Boolean",
              array: "Array",
              object: "Object (JSON)"
            }
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

// src/firestore/formConfig.json
var formConfig_default4 = {
  schema: {
    type: "object",
    properties: {
      connectionOption: {
        type: "string",
        enum: ["serviceAccount", "projectId"],
        default: "serviceAccount",
        description: "Choose authentication method"
      },
      projectId: {
        type: "string",
        description: "Firebase/GCP Project ID",
        minLength: 1
      },
      serviceAccountKey: {
        type: "string",
        description: "Service Account JSON key (paste the entire JSON content)",
        format: "textarea"
      },
      databaseURL: {
        type: "string",
        description: "Optional: Firestore database URL (for non-default databases)"
      }
    },
    required: ["connectionOption", "projectId"],
    allOf: [
      {
        if: {
          properties: {
            connectionOption: {
              const: "serviceAccount"
            }
          }
        },
        then: {
          required: ["serviceAccountKey"]
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
        label: "Authentication Method",
        options: {
          format: "radio"
        }
      },
      {
        type: "Control",
        scope: "#/properties/projectId",
        label: "Project ID"
      },
      {
        type: "Group",
        label: "Service Account",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/connectionOption",
            schema: { const: "serviceAccount" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/serviceAccountKey",
            label: "Service Account JSON Key",
            options: {
              multi: true,
              rows: 8
            }
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/databaseURL",
        label: "Database URL (Optional)"
      }
    ]
  },
  data: {
    connectionOption: "serviceAccount",
    projectId: "my-firebase-project",
    serviceAccountKey: "",
    databaseURL: ""
  }
};

// src/firestore/queryConfig.json
var queryConfig_default4 = {
  schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["get", "list", "query", "add", "set", "update", "delete"],
        default: "list",
        description: "Firestore operation to perform"
      },
      collectionPath: {
        type: "string",
        description: "Collection path (e.g., 'users' or 'users/uid/orders')"
      },
      documentId: {
        type: "string",
        description: "Document ID (for get, set, update, delete operations)"
      },
      data: {
        type: "string",
        description: "Document data as JSON (for add, set, update operations)",
        format: "code-json"
      },
      where: {
        type: "array",
        description: "Query conditions",
        items: {
          type: "object",
          properties: {
            field: { type: "string" },
            operator: {
              type: "string",
              enum: ["==", "!=", "<", "<=", ">", ">=", "array-contains", "array-contains-any", "in", "not-in"]
            },
            value: { type: "string" }
          },
          required: ["field", "operator", "value"]
        }
      },
      orderBy: {
        type: "object",
        properties: {
          field: { type: "string" },
          direction: {
            type: "string",
            enum: ["asc", "desc"],
            default: "asc"
          }
        }
      },
      limit: {
        type: "integer",
        description: "Maximum number of documents to return",
        minimum: 1,
        maximum: 1e3
      },
      args: {
        type: "array",
        description: "Query arguments",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            type: {
              type: "string",
              enum: ["string", "number", "boolean", "array", "object"],
              default: "string"
            }
          },
          required: ["key", "type"]
        }
      }
    },
    required: ["operation", "collectionPath"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/operation",
            label: "Operation"
          },
          {
            type: "Control",
            scope: "#/properties/collectionPath",
            label: "Collection Path"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/documentId",
        label: "Document ID",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { enum: ["get", "set", "update", "delete"] }
          }
        }
      },
      {
        type: "Control",
        scope: "#/properties/data",
        label: "Document Data (JSON)",
        options: {
          multi: true,
          rows: 6
        },
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { enum: ["add", "set", "update"] }
          }
        }
      },
      {
        type: "Group",
        label: "Query Options",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { enum: ["list", "query"] }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/where",
            label: "Where Conditions",
            options: {
              detail: {
                type: "HorizontalLayout",
                elements: [
                  { type: "Control", scope: "#/properties/field" },
                  { type: "Control", scope: "#/properties/operator" },
                  { type: "Control", scope: "#/properties/value" }
                ]
              }
            }
          },
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/orderBy/properties/field", label: "Order By Field" },
              { type: "Control", scope: "#/properties/orderBy/properties/direction", label: "Direction" }
            ]
          },
          {
            type: "Control",
            scope: "#/properties/limit",
            label: "Limit"
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
              { type: "Control", scope: "#/properties/key" },
              { type: "Control", scope: "#/properties/type" }
            ]
          },
          typeOptions: {
            enumLabels: {
              string: "String",
              number: "Number",
              boolean: "Boolean",
              array: "Array",
              object: "Object (JSON)"
            }
          }
        }
      }
    ]
  },
  data: {
    operation: "list",
    collectionPath: "users",
    limit: 100
  }
};

// src/mysql/formConfig.json
var formConfig_default5 = {
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
            description: "The hostname or IP address of the MySQL server.",
            format: "hostname"
          },
          port: {
            type: "integer",
            description: "The port number of the MySQL server (default is 3306).",
            minimum: 1,
            maximum: 65535,
            default: 3306
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
          ssl: {
            type: "boolean",
            description: "Enable SSL/TLS for the connection.",
            default: false
          },
          additionalOptions: {
            type: "object",
            description: "Additional connection options.",
            properties: {
              connectTimeout: {
                type: "integer",
                description: "Connection timeout in milliseconds.",
                minimum: 0,
                default: 1e4
              },
              timezone: {
                type: "string",
                description: "Timezone for the connection (e.g., '+05:30', 'Z')."
              }
            },
            additionalProperties: true
          }
        },
        required: ["connectionName", "host", "database", "user", "password"]
      },
      connectionString: {
        type: "string",
        description: "The full MySQL connection string (e.g., 'mysql://user:password@host:port/database').",
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
            scope: "#/properties/connectionDetails/properties/ssl",
            label: "Enable SSL"
          },
          {
            type: "Group",
            label: "Advanced Options",
            elements: [
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/additionalOptions/properties/connectTimeout",
                label: "Connection Timeout (ms)"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/additionalOptions/properties/timezone",
                label: "Timezone"
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
      connectionName: "MyDevMySQL",
      host: "localhost",
      port: 3306,
      database: "mydatabase",
      user: "root",
      password: "",
      ssl: false,
      additionalOptions: {
        connectTimeout: 1e4,
        timezone: "Z"
      }
    },
    connectionString: ""
  }
};

// src/mysql/queryConfig.json
var queryConfig_default5 = {
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
        description: "MySQL code to execute",
        format: "code-mysql"
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
                "array",
                "object"
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
            label: "Raw SQL"
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
          },
          typeOptions: {
            enumLabels: {
              string: "String",
              number: "Number",
              boolean: "Boolean",
              array: "Array",
              object: "Object (JSON)"
            }
          }
        }
      }
    ]
  },
  data: {
    queryType: "query",
    query: "SELECT id, name FROM users WHERE active = 1;",
    args: [
      {
        key: "user_id",
        type: "string"
      }
    ]
  }
};

// src/mongodb/formConfig.json
var formConfig_default6 = {
  schema: {
    type: "object",
    properties: {
      connectionOption: {
        type: "string",
        enum: ["connectionString", "connectionDetails"],
        default: "connectionString",
        description: "Choose to enter connection string or individual details."
      },
      connectionString: {
        type: "string",
        description: "MongoDB connection URI (e.g., 'mongodb://localhost:27017/mydb' or 'mongodb+srv://...').",
        minLength: 1
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
            description: "The hostname or IP address of the MongoDB server.",
            format: "hostname"
          },
          port: {
            type: "integer",
            description: "The port number of the MongoDB server (default is 27017).",
            minimum: 1,
            maximum: 65535,
            default: 27017
          },
          database: {
            type: "string",
            description: "The name of the database to connect to.",
            minLength: 1
          },
          username: {
            type: "string",
            description: "Username for authentication (optional)."
          },
          password: {
            type: "string",
            description: "Password for authentication (optional).",
            format: "password"
          },
          authSource: {
            type: "string",
            description: "Authentication database (default is 'admin').",
            default: "admin"
          },
          ssl: {
            type: "boolean",
            description: "Enable SSL/TLS for the connection.",
            default: false
          },
          replicaSet: {
            type: "string",
            description: "Replica set name (optional)."
          }
        },
        required: ["connectionName", "host", "database"]
      }
    },
    required: ["connectionOption"],
    allOf: [
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
      },
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
            label: "MongoDB Connection URI",
            options: {
              multi: true,
              rows: 2
            }
          }
        ]
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
                scope: "#/properties/connectionDetails/properties/username",
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
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/authSource",
                label: "Auth Database"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/replicaSet",
                label: "Replica Set"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/ssl",
                label: "Enable SSL"
              }
            ]
          }
        ]
      }
    ]
  },
  data: {
    connectionOption: "connectionString",
    connectionString: "mongodb://localhost:27017/mydb",
    connectionDetails: {
      connectionName: "MyDevMongoDB",
      host: "localhost",
      port: 27017,
      database: "mydb",
      username: "",
      password: "",
      authSource: "admin",
      ssl: false,
      replicaSet: ""
    }
  }
};

// src/mongodb/queryConfig.json
var queryConfig_default6 = {
  schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["find", "findOne", "insertOne", "insertMany", "updateOne", "updateMany", "deleteOne", "deleteMany", "aggregate", "count"],
        default: "find",
        description: "MongoDB operation to perform"
      },
      collection: {
        type: "string",
        description: "Name of the collection to query",
        minLength: 1
      },
      filter: {
        type: "string",
        description: "Query filter document (JSON format)",
        format: "code-json",
        default: "{}"
      },
      projection: {
        type: "string",
        description: "Fields to include/exclude (JSON format)",
        format: "code-json"
      },
      sort: {
        type: "string",
        description: 'Sort order document (JSON format, e.g., {"createdAt": -1})',
        format: "code-json"
      },
      limit: {
        type: "integer",
        description: "Maximum number of documents to return",
        minimum: 0
      },
      skip: {
        type: "integer",
        description: "Number of documents to skip",
        minimum: 0
      },
      document: {
        type: "string",
        description: "Document to insert or update data (JSON format)",
        format: "code-json"
      },
      pipeline: {
        type: "string",
        description: "Aggregation pipeline stages (JSON array format)",
        format: "code-json"
      },
      options: {
        type: "object",
        description: "Additional operation options",
        properties: {
          upsert: {
            type: "boolean",
            description: "Create document if it doesn't exist (for update operations)",
            default: false
          }
        }
      },
      args: {
        type: "array",
        description: "Dynamic arguments to inject into filter/document",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string"
            },
            type: {
              type: "string",
              enum: ["string", "number", "boolean", "objectId", "date", "array", "object"],
              default: "string"
            }
          },
          required: ["key", "type"]
        }
      }
    },
    required: ["operation", "collection"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/operation",
            label: "Operation"
          },
          {
            type: "Control",
            scope: "#/properties/collection",
            label: "Collection"
          }
        ]
      },
      {
        type: "Group",
        label: "Query Options",
        rule: {
          effect: "SHOW",
          condition: {
            type: "OR",
            conditions: [
              { scope: "#/properties/operation", schema: { const: "find" } },
              { scope: "#/properties/operation", schema: { const: "findOne" } },
              { scope: "#/properties/operation", schema: { const: "count" } }
            ]
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/filter",
            label: "Filter"
          },
          {
            type: "Control",
            scope: "#/properties/projection",
            label: "Projection",
            rule: {
              effect: "SHOW",
              condition: {
                type: "OR",
                conditions: [
                  { scope: "#/properties/operation", schema: { const: "find" } },
                  { scope: "#/properties/operation", schema: { const: "findOne" } }
                ]
              }
            }
          },
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/sort",
                label: "Sort"
              },
              {
                type: "Control",
                scope: "#/properties/limit",
                label: "Limit"
              },
              {
                type: "Control",
                scope: "#/properties/skip",
                label: "Skip"
              }
            ],
            rule: {
              effect: "SHOW",
              condition: {
                scope: "#/properties/operation",
                schema: { const: "find" }
              }
            }
          }
        ]
      },
      {
        type: "Group",
        label: "Document",
        rule: {
          effect: "SHOW",
          condition: {
            type: "OR",
            conditions: [
              { scope: "#/properties/operation", schema: { const: "insertOne" } },
              { scope: "#/properties/operation", schema: { const: "insertMany" } }
            ]
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/document",
            label: "Document(s) to Insert"
          }
        ]
      },
      {
        type: "Group",
        label: "Update",
        rule: {
          effect: "SHOW",
          condition: {
            type: "OR",
            conditions: [
              { scope: "#/properties/operation", schema: { const: "updateOne" } },
              { scope: "#/properties/operation", schema: { const: "updateMany" } }
            ]
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/filter",
            label: "Filter"
          },
          {
            type: "Control",
            scope: "#/properties/document",
            label: "Update Document"
          },
          {
            type: "Control",
            scope: "#/properties/options/properties/upsert",
            label: "Upsert (create if not exists)"
          }
        ]
      },
      {
        type: "Group",
        label: "Delete",
        rule: {
          effect: "SHOW",
          condition: {
            type: "OR",
            conditions: [
              { scope: "#/properties/operation", schema: { const: "deleteOne" } },
              { scope: "#/properties/operation", schema: { const: "deleteMany" } }
            ]
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/filter",
            label: "Filter"
          }
        ]
      },
      {
        type: "Group",
        label: "Aggregation Pipeline",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { const: "aggregate" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/pipeline",
            label: "Pipeline Stages"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/args",
        label: "Dynamic Arguments",
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
    operation: "find",
    collection: "users",
    filter: "{}",
    projection: "",
    sort: '{"createdAt": -1}',
    limit: 100,
    skip: 0,
    document: "",
    pipeline: "",
    options: {
      upsert: false
    },
    args: []
  }
};

// src/googlesheets/formConfig.json
var formConfig_default7 = {
  schema: {
    type: "object",
    properties: {
      authType: {
        type: "string",
        enum: ["serviceAccount", "oauth2"],
        default: "serviceAccount",
        description: "Choose authentication method"
      },
      connectionName: {
        type: "string",
        description: "A unique name for this data source connection.",
        minLength: 3
      },
      serviceAccountKey: {
        type: "string",
        description: "Service Account JSON key (paste the entire JSON content)",
        format: "textarea"
      },
      oauth2: {
        type: "object",
        description: "OAuth2 credentials",
        properties: {
          clientId: {
            type: "string",
            description: "OAuth2 Client ID"
          },
          clientSecret: {
            type: "string",
            description: "OAuth2 Client Secret",
            format: "password"
          },
          refreshToken: {
            type: "string",
            description: "OAuth2 Refresh Token",
            format: "password"
          }
        },
        required: ["clientId", "clientSecret", "refreshToken"]
      },
      defaultSpreadsheetId: {
        type: "string",
        description: "Default Spreadsheet ID to use (optional, can be specified per query)"
      }
    },
    required: ["authType", "connectionName"],
    allOf: [
      {
        if: {
          properties: {
            authType: {
              const: "serviceAccount"
            }
          }
        },
        then: {
          required: ["serviceAccountKey"]
        }
      },
      {
        if: {
          properties: {
            authType: {
              const: "oauth2"
            }
          }
        },
        then: {
          required: ["oauth2"]
        }
      }
    ]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/connectionName",
        label: "Connection Name"
      },
      {
        type: "Control",
        scope: "#/properties/authType",
        label: "Authentication Method",
        options: {
          format: "radio"
        }
      },
      {
        type: "Group",
        label: "Service Account",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/authType",
            schema: { const: "serviceAccount" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/serviceAccountKey",
            label: "Service Account JSON Key",
            options: {
              multi: true,
              rows: 10
            }
          }
        ]
      },
      {
        type: "Group",
        label: "OAuth2 Credentials",
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
            scope: "#/properties/oauth2/properties/clientId",
            label: "Client ID"
          },
          {
            type: "Control",
            scope: "#/properties/oauth2/properties/clientSecret",
            label: "Client Secret",
            options: {
              format: "password"
            }
          },
          {
            type: "Control",
            scope: "#/properties/oauth2/properties/refreshToken",
            label: "Refresh Token",
            options: {
              format: "password"
            }
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/defaultSpreadsheetId",
        label: "Default Spreadsheet ID (Optional)"
      }
    ]
  },
  data: {
    authType: "serviceAccount",
    connectionName: "MyGoogleSheets",
    serviceAccountKey: "",
    oauth2: {
      clientId: "",
      clientSecret: "",
      refreshToken: ""
    },
    defaultSpreadsheetId: ""
  }
};

// src/googlesheets/queryConfig.json
var queryConfig_default7 = {
  schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["read", "write", "append", "update", "clear", "getSpreadsheetInfo"],
        default: "read",
        description: "Google Sheets operation to perform"
      },
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet (from the URL)"
      },
      sheetName: {
        type: "string",
        description: "Name of the sheet/tab within the spreadsheet"
      },
      range: {
        type: "string",
        description: "Cell range in A1 notation (e.g., 'A1:D10', 'Sheet1!A1:D10')",
        default: "A1:Z1000"
      },
      data: {
        type: "string",
        description: "Data to write (JSON array of arrays for rows/columns)",
        format: "code-json"
      },
      valueInputOption: {
        type: "string",
        enum: ["RAW", "USER_ENTERED"],
        default: "USER_ENTERED",
        description: "How input data should be interpreted"
      },
      insertDataOption: {
        type: "string",
        enum: ["OVERWRITE", "INSERT_ROWS"],
        default: "INSERT_ROWS",
        description: "How to insert data when appending"
      },
      majorDimension: {
        type: "string",
        enum: ["ROWS", "COLUMNS"],
        default: "ROWS",
        description: "The major dimension of the data"
      },
      includeHeaders: {
        type: "boolean",
        description: "Treat first row as headers when reading",
        default: true
      },
      args: {
        type: "array",
        description: "Dynamic arguments",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string"
            },
            type: {
              type: "string",
              enum: ["string", "number", "boolean"],
              default: "string"
            }
          },
          required: ["key", "type"]
        }
      }
    },
    required: ["operation", "spreadsheetId"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/operation",
        label: "Operation"
      },
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/spreadsheetId",
            label: "Spreadsheet ID"
          },
          {
            type: "Control",
            scope: "#/properties/sheetName",
            label: "Sheet Name"
          }
        ]
      },
      {
        type: "Group",
        label: "Read Options",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { const: "read" }
          }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/range",
                label: "Range (A1 notation)"
              },
              {
                type: "Control",
                scope: "#/properties/majorDimension",
                label: "Major Dimension"
              }
            ]
          },
          {
            type: "Control",
            scope: "#/properties/includeHeaders",
            label: "Treat first row as headers"
          }
        ]
      },
      {
        type: "Group",
        label: "Write Options",
        rule: {
          effect: "SHOW",
          condition: {
            type: "OR",
            conditions: [
              { scope: "#/properties/operation", schema: { const: "write" } },
              { scope: "#/properties/operation", schema: { const: "update" } }
            ]
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/range",
            label: "Range (A1 notation)"
          },
          {
            type: "Control",
            scope: "#/properties/data",
            label: "Data (JSON array of arrays)"
          },
          {
            type: "Control",
            scope: "#/properties/valueInputOption",
            label: "Value Input Option"
          }
        ]
      },
      {
        type: "Group",
        label: "Append Options",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { const: "append" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/range",
            label: "Range (A1 notation)"
          },
          {
            type: "Control",
            scope: "#/properties/data",
            label: "Data (JSON array of arrays)"
          },
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/valueInputOption",
                label: "Value Input Option"
              },
              {
                type: "Control",
                scope: "#/properties/insertDataOption",
                label: "Insert Data Option"
              }
            ]
          }
        ]
      },
      {
        type: "Group",
        label: "Clear Options",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { const: "clear" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/range",
            label: "Range to Clear (A1 notation)"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/args",
        label: "Dynamic Arguments",
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
    operation: "read",
    spreadsheetId: "",
    sheetName: "Sheet1",
    range: "A1:Z1000",
    data: '[["Header1", "Header2"], ["Value1", "Value2"]]',
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    majorDimension: "ROWS",
    includeHeaders: true,
    args: []
  }
};

// src/graphql/formConfig.json
var formConfig_default8 = {
  schema: {
    type: "object",
    properties: {
      connectionName: {
        type: "string",
        description: "A unique name for this data source connection.",
        minLength: 3
      },
      endpoint: {
        type: "string",
        description: "The GraphQL endpoint URL",
        format: "uri",
        minLength: 1
      },
      authType: {
        type: "string",
        enum: ["none", "bearer", "apiKey", "basic"],
        default: "none",
        description: "Authentication method"
      },
      bearerToken: {
        type: "string",
        description: "Bearer token for authentication",
        format: "password"
      },
      apiKey: {
        type: "object",
        properties: {
          headerName: {
            type: "string",
            description: "Header name for API key (e.g., 'x-api-key')",
            default: "x-api-key"
          },
          value: {
            type: "string",
            description: "API key value",
            format: "password"
          }
        }
      },
      basicAuth: {
        type: "object",
        properties: {
          username: {
            type: "string",
            description: "Username for basic auth"
          },
          password: {
            type: "string",
            description: "Password for basic auth",
            format: "password"
          }
        }
      },
      headers: {
        type: "array",
        description: "Additional headers to include in requests",
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
          required: ["key", "value"]
        }
      },
      timeout: {
        type: "integer",
        description: "Request timeout in seconds",
        default: 30,
        minimum: 1,
        maximum: 300
      }
    },
    required: ["connectionName", "endpoint"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/connectionName",
            label: "Connection Name"
          },
          {
            type: "Control",
            scope: "#/properties/endpoint",
            label: "GraphQL Endpoint URL"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/authType",
        label: "Authentication"
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
            scope: "#/properties/bearerToken",
            label: "Bearer Token",
            options: {
              format: "password"
            }
          }
        ]
      },
      {
        type: "Group",
        label: "API Key",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/authType",
            schema: { const: "apiKey" }
          }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/apiKey/properties/headerName",
                label: "Header Name"
              },
              {
                type: "Control",
                scope: "#/properties/apiKey/properties/value",
                label: "API Key",
                options: {
                  format: "password"
                }
              }
            ]
          }
        ]
      },
      {
        type: "Group",
        label: "Basic Authentication",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/authType",
            schema: { const: "basic" }
          }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/basicAuth/properties/username",
                label: "Username"
              },
              {
                type: "Control",
                scope: "#/properties/basicAuth/properties/password",
                label: "Password",
                options: {
                  format: "password"
                }
              }
            ]
          }
        ]
      },
      {
        type: "Group",
        label: "Advanced Options",
        elements: [
          {
            type: "Control",
            scope: "#/properties/timeout",
            label: "Timeout (seconds)"
          },
          {
            type: "Control",
            scope: "#/properties/headers",
            label: "Custom Headers",
            options: {
              detail: {
                type: "HorizontalLayout",
                elements: [
                  {
                    type: "Control",
                    scope: "#/properties/key",
                    label: "Header"
                  },
                  {
                    type: "Control",
                    scope: "#/properties/value",
                    label: "Value"
                  }
                ]
              }
            }
          }
        ]
      }
    ]
  },
  data: {
    connectionName: "MyGraphQLAPI",
    endpoint: "https://api.example.com/graphql",
    authType: "none",
    bearerToken: "",
    apiKey: {
      headerName: "x-api-key",
      value: ""
    },
    basicAuth: {
      username: "",
      password: ""
    },
    headers: [],
    timeout: 30
  }
};

// src/graphql/queryConfig.json
var queryConfig_default8 = {
  schema: {
    type: "object",
    properties: {
      operationType: {
        type: "string",
        enum: ["query", "mutation"],
        default: "query",
        description: "Type of GraphQL operation"
      },
      query: {
        type: "string",
        description: "GraphQL query or mutation",
        format: "code-graphql"
      },
      variables: {
        type: "string",
        description: "Variables for the query (JSON format)",
        format: "code-json"
      },
      operationName: {
        type: "string",
        description: "Operation name (optional, for queries with multiple operations)"
      },
      args: {
        type: "array",
        description: "Dynamic arguments to inject into variables",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string"
            },
            type: {
              type: "string",
              enum: ["string", "number", "boolean", "array", "object"],
              default: "string"
            }
          },
          required: ["key", "type"]
        }
      }
    },
    required: ["query"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/operationType",
        label: "Operation Type"
      },
      {
        type: "Control",
        scope: "#/properties/query",
        label: "GraphQL Query / Mutation"
      },
      {
        type: "Control",
        scope: "#/properties/variables",
        label: "Variables (JSON)"
      },
      {
        type: "Control",
        scope: "#/properties/operationName",
        label: "Operation Name (Optional)"
      },
      {
        type: "Control",
        scope: "#/properties/args",
        label: "Dynamic Arguments",
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
    operationType: "query",
    query: "query GetUsers($limit: Int) {\n  users(limit: $limit) {\n    id\n    name\n    email\n  }\n}",
    variables: '{\n  "limit": 10\n}',
    operationName: "",
    args: []
  }
};

// src/rabbitmq/formConfig.json
var formConfig_default9 = {
  schema: {
    type: "object",
    properties: {
      connectionOption: {
        type: "string",
        enum: ["connectionUrl", "connectionDetails"],
        default: "connectionDetails",
        description: "Choose to enter connection URL or individual details."
      },
      connectionUrl: {
        type: "string",
        description: "AMQP connection URL (e.g., 'amqp://user:pass@localhost:5672/vhost')",
        minLength: 1
      },
      connectionDetails: {
        type: "object",
        properties: {
          connectionName: {
            type: "string",
            description: "A unique name for this connection.",
            minLength: 3
          },
          host: {
            type: "string",
            description: "RabbitMQ server hostname.",
            default: "localhost"
          },
          port: {
            type: "integer",
            description: "RabbitMQ server port (default 5672).",
            minimum: 1,
            maximum: 65535,
            default: 5672
          },
          vhost: {
            type: "string",
            description: "Virtual host (default '/').",
            default: "/"
          },
          username: {
            type: "string",
            description: "Username for authentication.",
            default: "guest"
          },
          password: {
            type: "string",
            description: "Password for authentication.",
            format: "password"
          },
          heartbeat: {
            type: "integer",
            description: "Heartbeat interval in seconds (0 to disable).",
            minimum: 0,
            default: 60
          },
          ssl: {
            type: "boolean",
            description: "Enable SSL/TLS connection.",
            default: false
          }
        },
        required: ["connectionName", "host", "username", "password"]
      }
    },
    required: ["connectionOption"],
    allOf: [
      {
        if: {
          properties: { connectionOption: { const: "connectionUrl" } }
        },
        then: { required: ["connectionUrl"] }
      },
      {
        if: {
          properties: { connectionOption: { const: "connectionDetails" } }
        },
        then: { required: ["connectionDetails"] }
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
        label: "Connection URL",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/connectionOption",
            schema: { const: "connectionUrl" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/connectionUrl",
            label: "AMQP URL"
          }
        ]
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
            type: "Control",
            scope: "#/properties/connectionDetails/properties/connectionName",
            label: "Connection Name"
          },
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/host",
                label: "Host"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/port",
                label: "Port"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/vhost",
                label: "Virtual Host"
              }
            ]
          },
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/username",
                label: "Username"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/password",
                label: "Password",
                options: { format: "password" }
              }
            ]
          },
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/heartbeat",
                label: "Heartbeat (seconds)"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/ssl",
                label: "Enable SSL"
              }
            ]
          }
        ]
      }
    ]
  },
  data: {
    connectionOption: "connectionDetails",
    connectionUrl: "",
    connectionDetails: {
      connectionName: "MyRabbitMQ",
      host: "localhost",
      port: 5672,
      vhost: "/",
      username: "guest",
      password: "guest",
      heartbeat: 60,
      ssl: false
    }
  }
};

// src/rabbitmq/queryConfig.json
var queryConfig_default9 = {
  schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["publish", "consume", "peek", "ack", "nack", "purge", "getQueueInfo", "deleteQueue"],
        default: "publish",
        description: "RabbitMQ operation"
      },
      queue: {
        type: "string",
        description: "Queue name"
      },
      exchange: {
        type: "string",
        description: "Exchange name (optional, for publish)"
      },
      routingKey: {
        type: "string",
        description: "Routing key (optional)"
      },
      message: {
        type: "string",
        description: "Message content (JSON)",
        format: "code-json"
      },
      messageCount: {
        type: "integer",
        description: "Number of messages to consume",
        minimum: 1,
        default: 1
      },
      consumeMode: {
        type: "string",
        enum: ["preview", "consume", "consumeAndStore"],
        default: "preview",
        description: "How to handle consumed messages"
      },
      storeDestination: {
        type: "object",
        description: "Where to store consumed messages",
        properties: {
          type: {
            type: "string",
            enum: ["dataQuery"],
            default: "dataQuery"
          },
          dataQueryId: {
            type: "string",
            description: "Data query to execute with message"
          }
        }
      },
      queueOptions: {
        type: "object",
        properties: {
          durable: {
            type: "boolean",
            description: "Queue survives broker restart",
            default: true
          },
          autoDelete: {
            type: "boolean",
            description: "Delete when no consumers",
            default: false
          },
          exclusive: {
            type: "boolean",
            description: "Exclusive to this connection",
            default: false
          }
        }
      },
      messageOptions: {
        type: "object",
        properties: {
          persistent: {
            type: "boolean",
            description: "Message survives broker restart",
            default: true
          },
          contentType: {
            type: "string",
            default: "application/json"
          },
          expiration: {
            type: "string",
            description: "Message TTL in milliseconds"
          }
        }
      },
      args: {
        type: "array",
        description: "Dynamic arguments",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            type: {
              type: "string",
              enum: ["string", "number", "boolean", "object"],
              default: "string"
            }
          },
          required: ["key", "type"]
        }
      }
    },
    required: ["operation"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          { type: "Control", scope: "#/properties/operation", label: "Operation" },
          { type: "Control", scope: "#/properties/queue", label: "Queue Name" }
        ]
      },
      {
        type: "Group",
        label: "Publish Options",
        rule: {
          effect: "SHOW",
          condition: { scope: "#/properties/operation", schema: { const: "publish" } }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/exchange", label: "Exchange" },
              { type: "Control", scope: "#/properties/routingKey", label: "Routing Key" }
            ]
          },
          { type: "Control", scope: "#/properties/message", label: "Message (JSON)" },
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/messageOptions/properties/persistent", label: "Persistent" },
              { type: "Control", scope: "#/properties/messageOptions/properties/expiration", label: "TTL (ms)" }
            ]
          }
        ]
      },
      {
        type: "Group",
        label: "Consume Options",
        rule: {
          effect: "SHOW",
          condition: {
            type: "OR",
            conditions: [
              { scope: "#/properties/operation", schema: { const: "consume" } },
              { scope: "#/properties/operation", schema: { const: "peek" } }
            ]
          }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/messageCount", label: "Message Count" },
              { type: "Control", scope: "#/properties/consumeMode", label: "Consume Mode" }
            ]
          },
          {
            type: "Group",
            label: "Store Destination",
            rule: {
              effect: "SHOW",
              condition: { scope: "#/properties/consumeMode", schema: { const: "consumeAndStore" } }
            },
            elements: [
              { type: "Control", scope: "#/properties/storeDestination/properties/type", label: "Destination Type" },
              { type: "Control", scope: "#/properties/storeDestination/properties/dataQueryId", label: "Data Query ID" }
            ]
          }
        ]
      },
      {
        type: "Group",
        label: "Queue Options",
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/queueOptions/properties/durable", label: "Durable" },
              { type: "Control", scope: "#/properties/queueOptions/properties/autoDelete", label: "Auto Delete" },
              { type: "Control", scope: "#/properties/queueOptions/properties/exclusive", label: "Exclusive" }
            ]
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/args",
        label: "Dynamic Arguments"
      }
    ]
  },
  data: {
    operation: "publish",
    queue: "my-queue",
    exchange: "",
    routingKey: "",
    message: '{\n  "type": "order",\n  "data": {}\n}',
    messageCount: 1,
    consumeMode: "preview",
    storeDestination: { type: "dataQuery", dataQueryId: "" },
    queueOptions: { durable: true, autoDelete: false, exclusive: false },
    messageOptions: { persistent: true, contentType: "application/json" },
    args: []
  }
};

// src/kafka/formConfig.json
var formConfig_default10 = {
  schema: {
    type: "object",
    properties: {
      connectionName: {
        type: "string",
        description: "A unique name for this connection.",
        minLength: 3
      },
      brokers: {
        type: "string",
        description: "Comma-separated list of Kafka brokers (e.g., 'localhost:9092,localhost:9093')"
      },
      clientId: {
        type: "string",
        description: "Client identifier.",
        default: "jet-admin"
      },
      ssl: {
        type: "boolean",
        description: "Enable SSL/TLS.",
        default: false
      },
      sasl: {
        type: "object",
        description: "SASL authentication options",
        properties: {
          enabled: {
            type: "boolean",
            default: false
          },
          mechanism: {
            type: "string",
            enum: ["plain", "scram-sha-256", "scram-sha-512"],
            default: "plain"
          },
          username: { type: "string" },
          password: { type: "string", format: "password" }
        }
      },
      connectionTimeout: {
        type: "integer",
        description: "Connection timeout in ms",
        default: 1e4
      },
      requestTimeout: {
        type: "integer",
        description: "Request timeout in ms",
        default: 3e4
      }
    },
    required: ["connectionName", "brokers"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          { type: "Control", scope: "#/properties/connectionName", label: "Connection Name" },
          { type: "Control", scope: "#/properties/clientId", label: "Client ID" }
        ]
      },
      { type: "Control", scope: "#/properties/brokers", label: "Brokers (comma-separated)" },
      {
        type: "HorizontalLayout",
        elements: [
          { type: "Control", scope: "#/properties/ssl", label: "Enable SSL" },
          { type: "Control", scope: "#/properties/sasl/properties/enabled", label: "Enable SASL Auth" }
        ]
      },
      {
        type: "Group",
        label: "SASL Authentication",
        rule: {
          effect: "SHOW",
          condition: { scope: "#/properties/sasl/properties/enabled", schema: { const: true } }
        },
        elements: [
          { type: "Control", scope: "#/properties/sasl/properties/mechanism", label: "Mechanism" },
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/sasl/properties/username", label: "Username" },
              { type: "Control", scope: "#/properties/sasl/properties/password", label: "Password", options: { format: "password" } }
            ]
          }
        ]
      },
      {
        type: "Group",
        label: "Timeouts",
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/connectionTimeout", label: "Connection Timeout (ms)" },
              { type: "Control", scope: "#/properties/requestTimeout", label: "Request Timeout (ms)" }
            ]
          }
        ]
      }
    ]
  },
  data: {
    connectionName: "MyKafka",
    brokers: "localhost:9092",
    clientId: "jet-admin",
    ssl: false,
    sasl: { enabled: false, mechanism: "plain", username: "", password: "" },
    connectionTimeout: 1e4,
    requestTimeout: 3e4
  }
};

// src/kafka/queryConfig.json
var queryConfig_default10 = {
  schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["produce", "consume", "getTopicMetadata", "listTopics", "createTopic", "deleteTopic"],
        default: "produce"
      },
      topic: {
        type: "string",
        description: "Kafka topic name"
      },
      message: {
        type: "string",
        description: "Message content (JSON)",
        format: "code-json"
      },
      key: {
        type: "string",
        description: "Message key (optional)"
      },
      partition: {
        type: "integer",
        description: "Specific partition (optional)",
        minimum: 0
      },
      consumerGroup: {
        type: "string",
        description: "Consumer group ID",
        default: "jet-admin-group"
      },
      messageCount: {
        type: "integer",
        description: "Number of messages to consume",
        minimum: 1,
        default: 10
      },
      fromBeginning: {
        type: "boolean",
        description: "Start reading from beginning",
        default: false
      },
      consumeMode: {
        type: "string",
        enum: ["preview", "consume", "consumeAndStore"],
        default: "preview"
      },
      storeDestination: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["dataQuery"], default: "dataQuery" },
          dataQueryId: { type: "string" }
        }
      },
      topicConfig: {
        type: "object",
        description: "Topic configuration for createTopic",
        properties: {
          numPartitions: { type: "integer", default: 1 },
          replicationFactor: { type: "integer", default: 1 }
        }
      },
      args: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            type: { type: "string", enum: ["string", "number", "boolean", "object"], default: "string" }
          },
          required: ["key", "type"]
        }
      }
    },
    required: ["operation"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          { type: "Control", scope: "#/properties/operation", label: "Operation" },
          { type: "Control", scope: "#/properties/topic", label: "Topic" }
        ]
      },
      {
        type: "Group",
        label: "Produce Options",
        rule: {
          effect: "SHOW",
          condition: { scope: "#/properties/operation", schema: { const: "produce" } }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/key", label: "Message Key" },
              { type: "Control", scope: "#/properties/partition", label: "Partition" }
            ]
          },
          { type: "Control", scope: "#/properties/message", label: "Message (JSON)" }
        ]
      },
      {
        type: "Group",
        label: "Consume Options",
        rule: {
          effect: "SHOW",
          condition: { scope: "#/properties/operation", schema: { const: "consume" } }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/consumerGroup", label: "Consumer Group" },
              { type: "Control", scope: "#/properties/messageCount", label: "Message Count" }
            ]
          },
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/fromBeginning", label: "From Beginning" },
              { type: "Control", scope: "#/properties/consumeMode", label: "Consume Mode" }
            ]
          },
          {
            type: "Group",
            label: "Store Destination",
            rule: {
              effect: "SHOW",
              condition: { scope: "#/properties/consumeMode", schema: { const: "consumeAndStore" } }
            },
            elements: [
              { type: "Control", scope: "#/properties/storeDestination/properties/dataQueryId", label: "Data Query ID" }
            ]
          }
        ]
      },
      {
        type: "Group",
        label: "Topic Config",
        rule: {
          effect: "SHOW",
          condition: { scope: "#/properties/operation", schema: { const: "createTopic" } }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/topicConfig/properties/numPartitions", label: "Partitions" },
              { type: "Control", scope: "#/properties/topicConfig/properties/replicationFactor", label: "Replication Factor" }
            ]
          }
        ]
      },
      { type: "Control", scope: "#/properties/args", label: "Dynamic Arguments" }
    ]
  },
  data: {
    operation: "produce",
    topic: "my-topic",
    message: '{\n  "event": "order_created",\n  "data": {}\n}',
    key: "",
    consumerGroup: "jet-admin-group",
    messageCount: 10,
    fromBeginning: false,
    consumeMode: "preview",
    storeDestination: { type: "dataQuery", dataQueryId: "" },
    topicConfig: { numPartitions: 1, replicationFactor: 1 },
    args: []
  }
};

// src/redis/formConfig.json
var formConfig_default11 = {
  schema: {
    type: "object",
    properties: {
      connectionOption: {
        type: "string",
        enum: ["connectionUrl", "connectionDetails"],
        default: "connectionDetails"
      },
      connectionUrl: {
        type: "string",
        description: "Redis connection URL (e.g., 'redis://user:pass@localhost:6379/0')"
      },
      connectionDetails: {
        type: "object",
        properties: {
          connectionName: {
            type: "string",
            minLength: 3
          },
          host: {
            type: "string",
            default: "localhost"
          },
          port: {
            type: "integer",
            minimum: 1,
            maximum: 65535,
            default: 6379
          },
          password: {
            type: "string",
            format: "password"
          },
          database: {
            type: "integer",
            description: "Database index (0-15)",
            minimum: 0,
            maximum: 15,
            default: 0
          },
          tls: {
            type: "boolean",
            default: false
          },
          username: {
            type: "string",
            description: "Username (Redis 6+ ACL)"
          }
        },
        required: ["connectionName", "host"]
      },
      clusterMode: {
        type: "boolean",
        description: "Enable cluster mode",
        default: false
      },
      clusterNodes: {
        type: "string",
        description: "Cluster nodes (comma-separated host:port)"
      }
    },
    required: ["connectionOption"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      { type: "Control", scope: "#/properties/connectionOption", label: "Connection Type" },
      {
        type: "Group",
        label: "Connection URL",
        rule: { effect: "SHOW", condition: { scope: "#/properties/connectionOption", schema: { const: "connectionUrl" } } },
        elements: [
          { type: "Control", scope: "#/properties/connectionUrl", label: "Redis URL" }
        ]
      },
      {
        type: "Group",
        label: "Connection Details",
        rule: { effect: "SHOW", condition: { scope: "#/properties/connectionOption", schema: { const: "connectionDetails" } } },
        elements: [
          { type: "Control", scope: "#/properties/connectionDetails/properties/connectionName", label: "Connection Name" },
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/connectionDetails/properties/host", label: "Host" },
              { type: "Control", scope: "#/properties/connectionDetails/properties/port", label: "Port" },
              { type: "Control", scope: "#/properties/connectionDetails/properties/database", label: "Database" }
            ]
          },
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/connectionDetails/properties/username", label: "Username" },
              { type: "Control", scope: "#/properties/connectionDetails/properties/password", label: "Password", options: { format: "password" } }
            ]
          },
          { type: "Control", scope: "#/properties/connectionDetails/properties/tls", label: "Enable TLS" }
        ]
      },
      {
        type: "Group",
        label: "Cluster Mode",
        elements: [
          { type: "Control", scope: "#/properties/clusterMode", label: "Enable Cluster Mode" },
          {
            type: "Control",
            scope: "#/properties/clusterNodes",
            label: "Cluster Nodes",
            rule: { effect: "SHOW", condition: { scope: "#/properties/clusterMode", schema: { const: true } } }
          }
        ]
      }
    ]
  },
  data: {
    connectionOption: "connectionDetails",
    connectionUrl: "",
    connectionDetails: {
      connectionName: "MyRedis",
      host: "localhost",
      port: 6379,
      password: "",
      database: 0,
      tls: false,
      username: ""
    },
    clusterMode: false,
    clusterNodes: ""
  }
};

// src/redis/queryConfig.json
var queryConfig_default11 = {
  schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: [
          "get",
          "set",
          "del",
          "exists",
          "keys",
          "expire",
          "ttl",
          "hget",
          "hset",
          "hgetall",
          "hdel",
          "lpush",
          "rpush",
          "lpop",
          "rpop",
          "lrange",
          "llen",
          "sadd",
          "smembers",
          "srem",
          "sismember",
          "publish",
          "xadd",
          "xread",
          "xrange",
          "xlen"
        ],
        default: "get"
      },
      key: {
        type: "string",
        description: "Redis key"
      },
      value: {
        type: "string",
        description: "Value to set (JSON for objects)",
        format: "code-json"
      },
      field: {
        type: "string",
        description: "Hash field name"
      },
      pattern: {
        type: "string",
        description: "Key pattern for KEYS command",
        default: "*"
      },
      ttl: {
        type: "integer",
        description: "TTL in seconds",
        minimum: 0
      },
      start: {
        type: "integer",
        description: "Start index for list/stream operations",
        default: 0
      },
      stop: {
        type: "integer",
        description: "Stop index for list operations",
        default: -1
      },
      count: {
        type: "integer",
        description: "Number of items to read",
        default: 10
      },
      streamId: {
        type: "string",
        description: "Stream entry ID (for XREAD, use '$' for new entries)",
        default: "0"
      },
      channel: {
        type: "string",
        description: "Pub/sub channel name"
      },
      consumeMode: {
        type: "string",
        enum: ["preview", "consume", "consumeAndStore"],
        default: "preview"
      },
      storeDestination: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["dataQuery"], default: "dataQuery" },
          dataQueryId: { type: "string" }
        }
      },
      args: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            type: { type: "string", enum: ["string", "number", "boolean", "object"], default: "string" }
          }
        }
      }
    },
    required: ["operation"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          { type: "Control", scope: "#/properties/operation", label: "Operation" },
          { type: "Control", scope: "#/properties/key", label: "Key" }
        ]
      },
      {
        type: "Group",
        label: "Value",
        rule: {
          effect: "SHOW",
          condition: {
            type: "OR",
            conditions: [
              { scope: "#/properties/operation", schema: { const: "set" } },
              { scope: "#/properties/operation", schema: { const: "hset" } },
              { scope: "#/properties/operation", schema: { const: "lpush" } },
              { scope: "#/properties/operation", schema: { const: "rpush" } },
              { scope: "#/properties/operation", schema: { const: "sadd" } },
              { scope: "#/properties/operation", schema: { const: "publish" } },
              { scope: "#/properties/operation", schema: { const: "xadd" } }
            ]
          }
        },
        elements: [
          { type: "Control", scope: "#/properties/value", label: "Value (JSON)" },
          { type: "Control", scope: "#/properties/ttl", label: "TTL (seconds)" }
        ]
      },
      {
        type: "Group",
        label: "Hash Field",
        rule: {
          effect: "SHOW",
          condition: {
            type: "OR",
            conditions: [
              { scope: "#/properties/operation", schema: { const: "hget" } },
              { scope: "#/properties/operation", schema: { const: "hset" } },
              { scope: "#/properties/operation", schema: { const: "hdel" } }
            ]
          }
        },
        elements: [
          { type: "Control", scope: "#/properties/field", label: "Field" }
        ]
      },
      {
        type: "Group",
        label: "List/Stream Options",
        rule: {
          effect: "SHOW",
          condition: {
            type: "OR",
            conditions: [
              { scope: "#/properties/operation", schema: { const: "lrange" } },
              { scope: "#/properties/operation", schema: { const: "xread" } },
              { scope: "#/properties/operation", schema: { const: "xrange" } }
            ]
          }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/start", label: "Start" },
              { type: "Control", scope: "#/properties/stop", label: "Stop" },
              { type: "Control", scope: "#/properties/count", label: "Count" }
            ]
          },
          { type: "Control", scope: "#/properties/streamId", label: "Stream ID" }
        ]
      },
      {
        type: "Group",
        label: "Pub/Sub",
        rule: { effect: "SHOW", condition: { scope: "#/properties/operation", schema: { const: "publish" } } },
        elements: [
          { type: "Control", scope: "#/properties/channel", label: "Channel" }
        ]
      },
      {
        type: "Group",
        label: "Keys Pattern",
        rule: { effect: "SHOW", condition: { scope: "#/properties/operation", schema: { const: "keys" } } },
        elements: [
          { type: "Control", scope: "#/properties/pattern", label: "Pattern" }
        ]
      },
      {
        type: "Group",
        label: "Consume Options",
        rule: {
          effect: "SHOW",
          condition: {
            type: "OR",
            conditions: [
              { scope: "#/properties/operation", schema: { const: "lpop" } },
              { scope: "#/properties/operation", schema: { const: "rpop" } },
              { scope: "#/properties/operation", schema: { const: "xread" } }
            ]
          }
        },
        elements: [
          { type: "Control", scope: "#/properties/consumeMode", label: "Consume Mode" },
          {
            type: "Control",
            scope: "#/properties/storeDestination/properties/dataQueryId",
            label: "Store Data Query ID",
            rule: { effect: "SHOW", condition: { scope: "#/properties/consumeMode", schema: { const: "consumeAndStore" } } }
          }
        ]
      },
      { type: "Control", scope: "#/properties/args", label: "Dynamic Arguments" }
    ]
  },
  data: {
    operation: "get",
    key: "my-key",
    value: "",
    field: "",
    pattern: "*",
    ttl: 0,
    start: 0,
    stop: -1,
    count: 10,
    streamId: "0",
    channel: "",
    consumeMode: "preview",
    storeDestination: { type: "dataQuery", dataQueryId: "" },
    args: []
  }
};

// src/mssql/formConfig.json
var formConfig_default12 = {
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
          server: {
            type: "string",
            description: "The hostname or IP address of the SQL Server."
          },
          port: {
            type: "integer",
            description: "The port number of the SQL Server (default is 1433).",
            minimum: 1,
            maximum: 65535,
            default: 1433
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
          encrypt: {
            type: "boolean",
            description: "Enable encryption for the connection.",
            default: true
          },
          trustServerCertificate: {
            type: "boolean",
            description: "Trust the server certificate (useful for self-signed certs).",
            default: false
          }
        },
        required: ["connectionName", "server", "database", "user", "password"]
      },
      connectionString: {
        type: "string",
        description: "The full SQL Server connection string.",
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
                scope: "#/properties/connectionDetails/properties/server",
                label: "Server"
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
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/encrypt",
                label: "Encrypt Connection"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/trustServerCertificate",
                label: "Trust Server Certificate"
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
      connectionName: "MyMSSQLServer",
      server: "localhost",
      port: 1433,
      database: "master",
      user: "sa",
      password: "",
      encrypt: true,
      trustServerCertificate: false
    },
    connectionString: ""
  }
};

// src/mssql/queryConfig.json
var queryConfig_default12 = {
  schema: {
    type: "object",
    properties: {
      queryType: {
        type: "string",
        enum: ["query"],
        default: "query"
      },
      query: {
        type: "string",
        description: "T-SQL code to execute",
        format: "code-sql"
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
                "array",
                "object"
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
            label: "T-SQL Query"
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
          },
          typeOptions: {
            enumLabels: {
              string: "String",
              number: "Number",
              boolean: "Boolean",
              array: "Array",
              object: "Object (JSON)"
            }
          }
        }
      }
    ]
  },
  data: {
    queryType: "query",
    query: "SELECT TOP 10 * FROM sys.tables;",
    args: []
  }
};

// src/supabase/formConfig.json
var formConfig_default13 = {
  schema: {
    type: "object",
    properties: {
      projectUrl: {
        type: "string",
        description: "Your Supabase project URL (e.g., https://xxxxx.supabase.co)",
        minLength: 1
      },
      anonKey: {
        type: "string",
        description: "The anon/public API key for your Supabase project.",
        minLength: 1
      },
      serviceRoleKey: {
        type: "string",
        description: "The service role key for admin access (optional, use with caution).",
        format: "password"
      }
    },
    required: ["projectUrl", "anonKey"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/projectUrl",
        label: "Project URL"
      },
      {
        type: "Control",
        scope: "#/properties/anonKey",
        label: "Anon/Public Key"
      },
      {
        type: "Control",
        scope: "#/properties/serviceRoleKey",
        label: "Service Role Key (Optional)",
        options: {
          format: "password"
        }
      }
    ]
  },
  data: {
    projectUrl: "",
    anonKey: "",
    serviceRoleKey: ""
  }
};

// src/supabase/queryConfig.json
var queryConfig_default13 = {
  schema: {
    type: "object",
    properties: {
      queryType: {
        type: "string",
        enum: ["select", "insert", "update", "delete", "rpc"],
        default: "select"
      },
      table: {
        type: "string",
        description: "The table name to query"
      },
      columns: {
        type: "string",
        description: "Columns to select (comma-separated, or * for all)",
        default: "*"
      },
      filters: {
        type: "array",
        description: "Filter conditions",
        items: {
          type: "object",
          properties: {
            column: {
              type: "string"
            },
            operator: {
              type: "string",
              enum: ["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "is", "in"]
            },
            value: {
              type: "string"
            }
          },
          required: ["column", "operator", "value"]
        }
      },
      data: {
        type: "string",
        description: "JSON data for insert/update operations",
        format: "code-json"
      },
      functionName: {
        type: "string",
        description: "RPC function name to call"
      },
      functionArgs: {
        type: "string",
        description: "JSON arguments for RPC function",
        format: "code-json"
      },
      limit: {
        type: "integer",
        description: "Maximum number of rows to return",
        minimum: 1
      },
      orderBy: {
        type: "string",
        description: "Column to order by"
      },
      ascending: {
        type: "boolean",
        description: "Sort ascending",
        default: true
      }
    },
    required: ["queryType", "table"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/queryType",
            label: "Operation"
          },
          {
            type: "Control",
            scope: "#/properties/table",
            label: "Table Name"
          }
        ]
      },
      {
        type: "Group",
        label: "Select Options",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/queryType",
            schema: { const: "select" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/columns",
            label: "Columns"
          },
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/limit",
                label: "Limit"
              },
              {
                type: "Control",
                scope: "#/properties/orderBy",
                label: "Order By"
              },
              {
                type: "Control",
                scope: "#/properties/ascending",
                label: "Ascending"
              }
            ]
          }
        ]
      },
      {
        type: "Group",
        label: "Data",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/queryType",
            schema: { enum: ["insert", "update"] }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/data",
            label: "Data (JSON)"
          }
        ]
      },
      {
        type: "Group",
        label: "RPC Function",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/queryType",
            schema: { const: "rpc" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/functionName",
            label: "Function Name"
          },
          {
            type: "Control",
            scope: "#/properties/functionArgs",
            label: "Arguments (JSON)"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/filters",
        label: "Filters",
        options: {
          detail: {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/column"
              },
              {
                type: "Control",
                scope: "#/properties/operator"
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
  data: {
    queryType: "select",
    table: "",
    columns: "*",
    filters: [],
    limit: 100,
    ascending: true
  }
};

// src/bigquery/formConfig.json
var formConfig_default14 = {
  schema: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: "Your Google Cloud project ID",
        minLength: 1
      },
      keyFilePath: {
        type: "string",
        description: "Path to service account key file (JSON)"
      },
      credentials: {
        type: "string",
        description: "Service account credentials JSON (alternative to key file)",
        format: "code-json"
      },
      location: {
        type: "string",
        description: "Default dataset location (e.g., US, EU)",
        default: "US"
      }
    },
    required: ["projectId"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/projectId",
        label: "Project ID"
      },
      {
        type: "Control",
        scope: "#/properties/location",
        label: "Dataset Location"
      },
      {
        type: "Control",
        scope: "#/properties/keyFilePath",
        label: "Key File Path"
      },
      {
        type: "Control",
        scope: "#/properties/credentials",
        label: "Credentials JSON (Alternative)"
      }
    ]
  },
  data: {
    projectId: "",
    location: "US",
    keyFilePath: "",
    credentials: ""
  }
};

// src/bigquery/queryConfig.json
var queryConfig_default14 = {
  schema: {
    type: "object",
    properties: {
      queryType: {
        type: "string",
        enum: ["query"],
        default: "query"
      },
      query: {
        type: "string",
        description: "BigQuery SQL query",
        format: "code-sql"
      },
      useLegacySql: {
        type: "boolean",
        description: "Use legacy SQL syntax",
        default: false
      },
      args: {
        type: "array",
        description: "Query parameters",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string"
            },
            type: {
              type: "string",
              enum: ["STRING", "INT64", "FLOAT64", "BOOL", "DATE", "TIMESTAMP"],
              default: "STRING"
            }
          },
          required: ["key", "type"]
        }
      }
    },
    required: ["queryType", "query"]
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
        type: "Control",
        scope: "#/properties/query",
        label: "SQL Query"
      },
      {
        type: "Control",
        scope: "#/properties/useLegacySql",
        label: "Use Legacy SQL"
      },
      {
        type: "Control",
        scope: "#/properties/args",
        label: "Query Parameters",
        options: {
          detail: {
            type: "HorizontalLayout",
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
    query: "SELECT * FROM `project.dataset.table` LIMIT 100",
    useLegacySql: false,
    args: []
  }
};

// src/airtable/formConfig.json
var formConfig_default15 = {
  schema: {
    type: "object",
    properties: {
      apiKey: {
        type: "string",
        description: "Your Airtable API key or Personal Access Token",
        format: "password",
        minLength: 1
      },
      baseId: {
        type: "string",
        description: "The Airtable Base ID (starts with 'app')",
        minLength: 1
      }
    },
    required: ["apiKey", "baseId"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/apiKey",
        label: "API Key / Personal Access Token",
        options: {
          format: "password"
        }
      },
      {
        type: "Control",
        scope: "#/properties/baseId",
        label: "Base ID"
      }
    ]
  },
  data: {
    apiKey: "",
    baseId: ""
  }
};

// src/airtable/queryConfig.json
var queryConfig_default15 = {
  schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["list", "find", "create", "update", "delete"],
        default: "list"
      },
      tableName: {
        type: "string",
        description: "The name of the table",
        minLength: 1
      },
      recordId: {
        type: "string",
        description: "Record ID (for find/update/delete operations)"
      },
      fields: {
        type: "string",
        description: "JSON object of fields for create/update",
        format: "code-json"
      },
      filterByFormula: {
        type: "string",
        description: "Airtable formula to filter records"
      },
      maxRecords: {
        type: "integer",
        description: "Maximum number of records to return",
        minimum: 1,
        default: 100
      },
      sortField: {
        type: "string",
        description: "Field to sort by"
      },
      sortDirection: {
        type: "string",
        enum: ["asc", "desc"],
        default: "asc"
      },
      view: {
        type: "string",
        description: "View name to use"
      }
    },
    required: ["operation", "tableName"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/operation",
            label: "Operation"
          },
          {
            type: "Control",
            scope: "#/properties/tableName",
            label: "Table Name"
          }
        ]
      },
      {
        type: "Group",
        label: "Record ID",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { enum: ["find", "update", "delete"] }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/recordId",
            label: "Record ID"
          }
        ]
      },
      {
        type: "Group",
        label: "Fields Data",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { enum: ["create", "update"] }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/fields",
            label: "Fields (JSON)"
          }
        ]
      },
      {
        type: "Group",
        label: "List Options",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { const: "list" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/filterByFormula",
            label: "Filter Formula"
          },
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/maxRecords",
                label: "Max Records"
              },
              {
                type: "Control",
                scope: "#/properties/view",
                label: "View"
              }
            ]
          },
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/sortField",
                label: "Sort Field"
              },
              {
                type: "Control",
                scope: "#/properties/sortDirection",
                label: "Sort Direction"
              }
            ]
          }
        ]
      }
    ]
  },
  data: {
    operation: "list",
    tableName: "",
    maxRecords: 100,
    sortDirection: "asc"
  }
};

// src/s3/formConfig.json
var formConfig_default16 = {
  schema: {
    type: "object",
    properties: {
      accessKeyId: {
        type: "string",
        description: "AWS Access Key ID",
        minLength: 1
      },
      secretAccessKey: {
        type: "string",
        description: "AWS Secret Access Key",
        format: "password",
        minLength: 1
      },
      region: {
        type: "string",
        description: "AWS Region (e.g., us-east-1)",
        default: "us-east-1"
      },
      bucket: {
        type: "string",
        description: "Default S3 bucket name"
      },
      endpoint: {
        type: "string",
        description: "Custom endpoint URL (for S3-compatible services)"
      }
    },
    required: ["accessKeyId", "secretAccessKey", "region"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/accessKeyId",
            label: "Access Key ID"
          },
          {
            type: "Control",
            scope: "#/properties/secretAccessKey",
            label: "Secret Access Key",
            options: {
              format: "password"
            }
          }
        ]
      },
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/region",
            label: "Region"
          },
          {
            type: "Control",
            scope: "#/properties/bucket",
            label: "Default Bucket"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/endpoint",
        label: "Custom Endpoint (Optional)"
      }
    ]
  },
  data: {
    accessKeyId: "",
    secretAccessKey: "",
    region: "us-east-1",
    bucket: "",
    endpoint: ""
  }
};

// src/s3/queryConfig.json
var queryConfig_default16 = {
  schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["listObjects", "getObject", "putObject", "deleteObject", "headObject"],
        default: "listObjects"
      },
      bucket: {
        type: "string",
        description: "S3 bucket name (overrides default)"
      },
      prefix: {
        type: "string",
        description: "Key prefix for listing objects"
      },
      key: {
        type: "string",
        description: "Object key (path)"
      },
      body: {
        type: "string",
        description: "Object content for putObject"
      },
      contentType: {
        type: "string",
        description: "Content type for putObject",
        default: "application/octet-stream"
      },
      maxKeys: {
        type: "integer",
        description: "Maximum number of keys to return",
        default: 1e3,
        minimum: 1,
        maximum: 1e3
      },
      responseType: {
        type: "string",
        enum: ["text", "json", "base64"],
        default: "text",
        description: "Response format for getObject"
      }
    },
    required: ["operation"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/operation",
            label: "Operation"
          },
          {
            type: "Control",
            scope: "#/properties/bucket",
            label: "Bucket"
          }
        ]
      },
      {
        type: "Group",
        label: "List Options",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { const: "listObjects" }
          }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/prefix",
                label: "Prefix"
              },
              {
                type: "Control",
                scope: "#/properties/maxKeys",
                label: "Max Keys"
              }
            ]
          }
        ]
      },
      {
        type: "Group",
        label: "Object Key",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { enum: ["getObject", "putObject", "deleteObject", "headObject"] }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/key",
            label: "Object Key"
          }
        ]
      },
      {
        type: "Group",
        label: "Get Options",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { const: "getObject" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/responseType",
            label: "Response Type"
          }
        ]
      },
      {
        type: "Group",
        label: "Put Options",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { const: "putObject" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/body",
            label: "Content"
          },
          {
            type: "Control",
            scope: "#/properties/contentType",
            label: "Content Type"
          }
        ]
      }
    ]
  },
  data: {
    operation: "listObjects",
    bucket: "",
    prefix: "",
    maxKeys: 1e3,
    responseType: "text"
  }
};

// src/elasticsearch/formConfig.json
var formConfig_default17 = {
  schema: {
    type: "object",
    properties: {
      node: {
        type: "string",
        description: "Elasticsearch node URL (e.g., https://localhost:9200)",
        minLength: 1
      },
      authType: {
        type: "string",
        enum: ["none", "basic", "apiKey", "cloud"],
        default: "none"
      },
      username: {
        type: "string",
        description: "Username for basic auth"
      },
      password: {
        type: "string",
        description: "Password for basic auth",
        format: "password"
      },
      apiKey: {
        type: "string",
        description: "API Key for authentication",
        format: "password"
      },
      cloudId: {
        type: "string",
        description: "Elastic Cloud ID"
      }
    },
    required: ["authType"],
    allOf: [
      {
        if: {
          properties: { authType: { const: "none" } }
        },
        then: { required: ["node"] }
      },
      {
        if: {
          properties: { authType: { const: "basic" } }
        },
        then: { required: ["node", "username", "password"] }
      },
      {
        if: {
          properties: { authType: { const: "apiKey" } }
        },
        then: { required: ["node", "apiKey"] }
      },
      {
        if: {
          properties: { authType: { const: "cloud" } }
        },
        then: { required: ["cloudId", "apiKey"] }
      }
    ]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/authType",
        label: "Authentication Type"
      },
      {
        type: "Group",
        label: "Node Configuration",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/authType",
            schema: { enum: ["none", "basic", "apiKey"] }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/node",
            label: "Node URL"
          }
        ]
      },
      {
        type: "Group",
        label: "Cloud Configuration",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/authType",
            schema: { const: "cloud" }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/cloudId",
            label: "Cloud ID"
          }
        ]
      },
      {
        type: "Group",
        label: "Basic Authentication",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/authType",
            schema: { const: "basic" }
          }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/username",
                label: "Username"
              },
              {
                type: "Control",
                scope: "#/properties/password",
                label: "Password",
                options: { format: "password" }
              }
            ]
          }
        ]
      },
      {
        type: "Group",
        label: "API Key",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/authType",
            schema: { enum: ["apiKey", "cloud"] }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/apiKey",
            label: "API Key",
            options: { format: "password" }
          }
        ]
      }
    ]
  },
  data: {
    node: "https://localhost:9200",
    authType: "none",
    username: "",
    password: "",
    apiKey: "",
    cloudId: ""
  }
};

// src/elasticsearch/queryConfig.json
var queryConfig_default17 = {
  schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["search", "get", "index", "update", "delete", "count"],
        default: "search"
      },
      index: {
        type: "string",
        description: "Index name or pattern",
        minLength: 1
      },
      documentId: {
        type: "string",
        description: "Document ID (for get/update/delete)"
      },
      query: {
        type: "string",
        description: "Elasticsearch Query DSL (JSON)",
        format: "code-json"
      },
      body: {
        type: "string",
        description: "Document body for index/update (JSON)",
        format: "code-json"
      },
      size: {
        type: "integer",
        description: "Number of results to return",
        default: 10,
        minimum: 0
      },
      from: {
        type: "integer",
        description: "Starting offset for pagination",
        default: 0,
        minimum: 0
      },
      sort: {
        type: "string",
        description: "Sort criteria (JSON array)",
        format: "code-json"
      }
    },
    required: ["operation", "index"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/operation",
            label: "Operation"
          },
          {
            type: "Control",
            scope: "#/properties/index",
            label: "Index"
          }
        ]
      },
      {
        type: "Group",
        label: "Document ID",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { enum: ["get", "update", "delete"] }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/documentId",
            label: "Document ID"
          }
        ]
      },
      {
        type: "Group",
        label: "Search Query",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { enum: ["search", "count"] }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/query",
            label: "Query DSL (JSON)"
          },
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/size",
                label: "Size"
              },
              {
                type: "Control",
                scope: "#/properties/from",
                label: "From"
              }
            ]
          },
          {
            type: "Control",
            scope: "#/properties/sort",
            label: "Sort (JSON)"
          }
        ]
      },
      {
        type: "Group",
        label: "Document Body",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { enum: ["index", "update"] }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/body",
            label: "Document (JSON)"
          }
        ]
      }
    ]
  },
  data: {
    operation: "search",
    index: "",
    query: '{\n  "match_all": {}\n}',
    size: 10,
    from: 0
  }
};

// src/stripe/formConfig.json
var formConfig_default18 = {
  schema: {
    type: "object",
    properties: {
      secretKey: {
        type: "string",
        description: "Your Stripe Secret Key (starts with sk_)",
        format: "password",
        minLength: 1
      },
      apiVersion: {
        type: "string",
        description: "Stripe API version (optional, uses latest if not specified)"
      }
    },
    required: ["secretKey"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/secretKey",
        label: "Secret Key",
        options: {
          format: "password"
        }
      },
      {
        type: "Control",
        scope: "#/properties/apiVersion",
        label: "API Version (Optional)"
      }
    ]
  },
  data: {
    secretKey: "",
    apiVersion: ""
  }
};

// src/stripe/queryConfig.json
var queryConfig_default18 = {
  schema: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        enum: [
          "customers",
          "charges",
          "paymentIntents",
          "invoices",
          "subscriptions",
          "products",
          "prices",
          "refunds",
          "balanceTransactions",
          "payouts"
        ],
        default: "customers"
      },
      operation: {
        type: "string",
        enum: ["list", "retrieve", "create", "update"],
        default: "list"
      },
      resourceId: {
        type: "string",
        description: "Resource ID (for retrieve/update)"
      },
      params: {
        type: "string",
        description: "Request parameters (JSON)",
        format: "code-json"
      },
      limit: {
        type: "integer",
        description: "Maximum number of items to return",
        default: 10,
        minimum: 1,
        maximum: 100
      },
      startingAfter: {
        type: "string",
        description: "Cursor for pagination (ID of last item)"
      },
      expand: {
        type: "array",
        description: "Fields to expand",
        items: {
          type: "string"
        }
      }
    },
    required: ["resource", "operation"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/resource",
            label: "Resource"
          },
          {
            type: "Control",
            scope: "#/properties/operation",
            label: "Operation"
          }
        ]
      },
      {
        type: "Group",
        label: "Resource ID",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { enum: ["retrieve", "update"] }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/resourceId",
            label: "Resource ID"
          }
        ]
      },
      {
        type: "Group",
        label: "List Options",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { const: "list" }
          }
        },
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/limit",
                label: "Limit"
              },
              {
                type: "Control",
                scope: "#/properties/startingAfter",
                label: "Starting After"
              }
            ]
          }
        ]
      },
      {
        type: "Group",
        label: "Parameters",
        rule: {
          effect: "SHOW",
          condition: {
            scope: "#/properties/operation",
            schema: { enum: ["create", "update", "list"] }
          }
        },
        elements: [
          {
            type: "Control",
            scope: "#/properties/params",
            label: "Parameters (JSON)"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/expand",
        label: "Expand Fields"
      }
    ]
  },
  data: {
    resource: "customers",
    operation: "list",
    limit: 10,
    params: "{}",
    expand: []
  }
};

// src/oracle/formConfig.json
var formConfig_default19 = {
  schema: {
    type: "object",
    properties: {
      connectionOption: {
        type: "string",
        enum: ["connectionDetails", "connectionString"],
        default: "connectionDetails"
      },
      connectionDetails: {
        type: "object",
        properties: {
          connectionName: {
            type: "string",
            description: "A unique name for this connection.",
            minLength: 3
          },
          host: {
            type: "string",
            description: "The hostname or IP address of the Oracle server."
          },
          port: {
            type: "integer",
            description: "The port number (default is 1521).",
            default: 1521
          },
          serviceName: {
            type: "string",
            description: "The Oracle service name or SID."
          },
          user: {
            type: "string",
            description: "The username for connecting."
          },
          password: {
            type: "string",
            description: "The password for the user.",
            format: "password"
          }
        },
        required: ["connectionName", "host", "serviceName", "user", "password"]
      },
      connectionString: {
        type: "string",
        description: "Full Oracle connection string (e.g., 'host:port/serviceName')."
      }
    },
    required: ["connectionOption"]
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
            type: "Control",
            scope: "#/properties/connectionDetails/properties/connectionName",
            label: "Connection Name"
          },
          {
            type: "HorizontalLayout",
            elements: [
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
            type: "Control",
            scope: "#/properties/connectionDetails/properties/serviceName",
            label: "Service Name / SID"
          },
          {
            type: "HorizontalLayout",
            elements: [
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/user",
                label: "Username"
              },
              {
                type: "Control",
                scope: "#/properties/connectionDetails/properties/password",
                label: "Password",
                options: { format: "password" }
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
      connectionName: "",
      host: "localhost",
      port: 1521,
      serviceName: "ORCL",
      user: "",
      password: ""
    }
  }
};

// src/oracle/queryConfig.json
var queryConfig_default19 = {
  schema: {
    type: "object",
    properties: {
      queryType: {
        type: "string",
        enum: ["query"],
        default: "query"
      },
      query: {
        type: "string",
        description: "Oracle SQL query to execute",
        format: "code-sql"
      },
      args: {
        type: "array",
        description: "Query arguments",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            type: {
              type: "string",
              enum: ["string", "number", "boolean", "date"],
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
        type: "Control",
        scope: "#/properties/query",
        label: "SQL Query"
      },
      {
        type: "Control",
        scope: "#/properties/args",
        label: "Arguments"
      }
    ]
  },
  data: {
    queryType: "query",
    query: "SELECT * FROM dual",
    args: []
  }
};

// src/sqlite/formConfig.json
var formConfig_default20 = {
  schema: {
    type: "object",
    properties: {
      databasePath: {
        type: "string",
        description: "Path to the SQLite database file (use ':memory:' for in-memory)",
        minLength: 1
      },
      readonly: {
        type: "boolean",
        description: "Open database in read-only mode",
        default: false
      }
    },
    required: ["databasePath"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/databasePath",
        label: "Database Path"
      },
      {
        type: "Control",
        scope: "#/properties/readonly",
        label: "Read-Only Mode"
      }
    ]
  },
  data: {
    databasePath: "",
    readonly: false
  }
};

// src/sqlite/queryConfig.json
var queryConfig_default20 = {
  schema: {
    type: "object",
    properties: {
      queryType: {
        type: "string",
        enum: ["query"],
        default: "query"
      },
      query: {
        type: "string",
        description: "SQLite SQL query to execute",
        format: "code-sql"
      },
      args: {
        type: "array",
        description: "Query arguments",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            type: {
              type: "string",
              enum: ["string", "number", "boolean"],
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
        type: "Control",
        scope: "#/properties/query",
        label: "SQL Query"
      },
      {
        type: "Control",
        scope: "#/properties/args",
        label: "Arguments"
      }
    ]
  },
  data: {
    queryType: "query",
    query: "SELECT * FROM sqlite_master WHERE type='table';",
    args: []
  }
};

// src/cockroachdb/formConfig.json
var formConfig_default21 = {
  schema: {
    type: "object",
    properties: {
      connectionString: {
        type: "string",
        description: "CockroachDB connection string (postgresql:// format)",
        minLength: 1
      },
      ssl: {
        type: "boolean",
        description: "Enable SSL connection",
        default: true
      },
      sslCert: {
        type: "string",
        description: "Path to SSL certificate file (optional)"
      }
    },
    required: ["connectionString"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/connectionString",
        label: "Connection String"
      },
      {
        type: "Control",
        scope: "#/properties/ssl",
        label: "Enable SSL"
      },
      {
        type: "Control",
        scope: "#/properties/sslCert",
        label: "SSL Certificate Path (Optional)"
      }
    ]
  },
  data: {
    connectionString: "postgresql://user:password@localhost:26257/defaultdb?sslmode=require",
    ssl: true,
    sslCert: ""
  }
};

// src/cockroachdb/queryConfig.json
var queryConfig_default21 = {
  schema: {
    type: "object",
    properties: {
      queryType: {
        type: "string",
        enum: ["query"],
        default: "query"
      },
      query: {
        type: "string",
        description: "CockroachDB SQL query (PostgreSQL-compatible)",
        format: "code-pgsql"
      },
      args: {
        type: "array",
        description: "Query arguments",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            type: {
              type: "string",
              enum: ["string", "number", "boolean"],
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
        type: "Control",
        scope: "#/properties/query",
        label: "SQL Query"
      },
      {
        type: "Control",
        scope: "#/properties/args",
        label: "Arguments"
      }
    ]
  },
  data: {
    queryType: "query",
    query: "SELECT * FROM crdb_internal.tables LIMIT 10;",
    args: []
  }
};

// src/neo4j/formConfig.json
var formConfig_default22 = {
  schema: {
    type: "object",
    properties: {
      uri: {
        type: "string",
        description: "Neo4j connection URI (e.g., bolt://localhost:7687)",
        minLength: 1
      },
      username: {
        type: "string",
        description: "Neo4j username",
        default: "neo4j"
      },
      password: {
        type: "string",
        description: "Neo4j password",
        format: "password"
      },
      database: {
        type: "string",
        description: "Database name (optional, defaults to 'neo4j')",
        default: "neo4j"
      }
    },
    required: ["uri", "username", "password"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/uri",
        label: "Connection URI"
      },
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/username",
            label: "Username"
          },
          {
            type: "Control",
            scope: "#/properties/password",
            label: "Password",
            options: { format: "password" }
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/database",
        label: "Database"
      }
    ]
  },
  data: {
    uri: "bolt://localhost:7687",
    username: "neo4j",
    password: "",
    database: "neo4j"
  }
};

// src/neo4j/queryConfig.json
var queryConfig_default22 = {
  schema: {
    type: "object",
    properties: {
      queryType: {
        type: "string",
        enum: ["cypher"],
        default: "cypher"
      },
      query: {
        type: "string",
        description: "Cypher query to execute",
        format: "code-sql"
      },
      args: {
        type: "array",
        description: "Query parameters",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            type: {
              type: "string",
              enum: ["string", "number", "boolean", "array"],
              default: "string"
            }
          },
          required: ["key", "type"]
        }
      }
    },
    required: ["queryType", "query"]
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
        type: "Control",
        scope: "#/properties/query",
        label: "Cypher Query"
      },
      {
        type: "Control",
        scope: "#/properties/args",
        label: "Parameters"
      }
    ]
  },
  data: {
    queryType: "cypher",
    query: "MATCH (n) RETURN n LIMIT 10",
    args: []
  }
};

// src/twilio/formConfig.json
var formConfig_default23 = {
  schema: {
    type: "object",
    properties: {
      accountSid: {
        type: "string",
        description: "Twilio Account SID",
        minLength: 1
      },
      authToken: {
        type: "string",
        description: "Twilio Auth Token",
        format: "password",
        minLength: 1
      }
    },
    required: ["accountSid", "authToken"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/accountSid",
        label: "Account SID"
      },
      {
        type: "Control",
        scope: "#/properties/authToken",
        label: "Auth Token",
        options: { format: "password" }
      }
    ]
  },
  data: {
    accountSid: "",
    authToken: ""
  }
};

// src/twilio/queryConfig.json
var queryConfig_default23 = {
  schema: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        enum: ["messages", "calls", "accounts", "phonenumbers"],
        default: "messages"
      },
      operation: {
        type: "string",
        enum: ["list", "fetch", "create"],
        default: "list"
      },
      resourceSid: {
        type: "string",
        description: "Resource SID for fetch operation"
      },
      params: {
        type: "string",
        description: "Request parameters (JSON)",
        format: "code-json"
      },
      limit: {
        type: "integer",
        description: "Maximum results to return",
        default: 20,
        minimum: 1,
        maximum: 1e3
      }
    },
    required: ["resource", "operation"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/resource",
            label: "Resource"
          },
          {
            type: "Control",
            scope: "#/properties/operation",
            label: "Operation"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/resourceSid",
        label: "Resource SID"
      },
      {
        type: "Control",
        scope: "#/properties/params",
        label: "Parameters (JSON)"
      },
      {
        type: "Control",
        scope: "#/properties/limit",
        label: "Limit"
      }
    ]
  },
  data: {
    resource: "messages",
    operation: "list",
    limit: 20,
    params: "{}"
  }
};

// src/sendgrid/formConfig.json
var formConfig_default24 = {
  schema: {
    type: "object",
    properties: {
      apiKey: {
        type: "string",
        description: "SendGrid API Key",
        format: "password",
        minLength: 1
      }
    },
    required: ["apiKey"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/apiKey",
        label: "API Key",
        options: { format: "password" }
      }
    ]
  },
  data: {
    apiKey: ""
  }
};

// src/sendgrid/queryConfig.json
var queryConfig_default24 = {
  schema: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        enum: ["stats", "messages", "contacts", "templates", "suppressions"],
        default: "stats"
      },
      operation: {
        type: "string",
        enum: ["list", "get", "send"],
        default: "list"
      },
      params: {
        type: "string",
        description: "Request parameters or email data (JSON)",
        format: "code-json"
      },
      startDate: {
        type: "string",
        description: "Start date for stats (YYYY-MM-DD)"
      },
      endDate: {
        type: "string",
        description: "End date for stats (YYYY-MM-DD)"
      }
    },
    required: ["resource", "operation"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/resource",
            label: "Resource"
          },
          {
            type: "Control",
            scope: "#/properties/operation",
            label: "Operation"
          }
        ]
      },
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/startDate",
            label: "Start Date"
          },
          {
            type: "Control",
            scope: "#/properties/endDate",
            label: "End Date"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/params",
        label: "Parameters (JSON)"
      }
    ]
  },
  data: {
    resource: "stats",
    operation: "list",
    params: "{}"
  }
};

// src/slack/formConfig.json
var formConfig_default25 = {
  schema: {
    type: "object",
    properties: {
      botToken: {
        type: "string",
        description: "Slack Bot User OAuth Token (xoxb-...)",
        format: "password",
        minLength: 1
      }
    },
    required: ["botToken"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/botToken",
        label: "Bot Token",
        options: { format: "password" }
      }
    ]
  },
  data: {
    botToken: ""
  }
};

// src/slack/queryConfig.json
var queryConfig_default25 = {
  schema: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        enum: ["channels", "users", "messages", "conversations"],
        default: "channels"
      },
      operation: {
        type: "string",
        enum: ["list", "info", "history", "post"],
        default: "list"
      },
      channelId: {
        type: "string",
        description: "Channel ID for channel-specific operations"
      },
      userId: {
        type: "string",
        description: "User ID for user-specific operations"
      },
      message: {
        type: "string",
        description: "Message text for post operation"
      },
      limit: {
        type: "integer",
        description: "Maximum results to return",
        default: 100,
        minimum: 1,
        maximum: 1e3
      }
    },
    required: ["resource", "operation"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/resource",
            label: "Resource"
          },
          {
            type: "Control",
            scope: "#/properties/operation",
            label: "Operation"
          }
        ]
      },
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/channelId",
            label: "Channel ID"
          },
          {
            type: "Control",
            scope: "#/properties/userId",
            label: "User ID"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/message",
        label: "Message"
      },
      {
        type: "Control",
        scope: "#/properties/limit",
        label: "Limit"
      }
    ]
  },
  data: {
    resource: "channels",
    operation: "list",
    limit: 100
  }
};

// src/notion/formConfig.json
var formConfig_default26 = {
  schema: {
    type: "object",
    properties: {
      apiToken: {
        type: "string",
        description: "Notion Integration Token",
        format: "password",
        minLength: 1
      }
    },
    required: ["apiToken"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/apiToken",
        label: "Integration Token",
        options: { format: "password" }
      }
    ]
  },
  data: {
    apiToken: ""
  }
};

// src/notion/queryConfig.json
var queryConfig_default26 = {
  schema: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        enum: ["databases", "pages", "blocks", "users", "search"],
        default: "databases"
      },
      operation: {
        type: "string",
        enum: ["list", "query", "retrieve", "create", "update"],
        default: "list"
      },
      databaseId: {
        type: "string",
        description: "Database ID for database operations"
      },
      pageId: {
        type: "string",
        description: "Page ID for page operations"
      },
      filter: {
        type: "string",
        description: "Filter object (JSON) for query",
        format: "code-json"
      },
      sorts: {
        type: "string",
        description: "Sort array (JSON) for query",
        format: "code-json"
      },
      searchQuery: {
        type: "string",
        description: "Search query text"
      },
      pageSize: {
        type: "integer",
        description: "Page size",
        default: 100,
        minimum: 1,
        maximum: 100
      }
    },
    required: ["resource", "operation"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/resource",
            label: "Resource"
          },
          {
            type: "Control",
            scope: "#/properties/operation",
            label: "Operation"
          }
        ]
      },
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/databaseId",
            label: "Database ID"
          },
          {
            type: "Control",
            scope: "#/properties/pageId",
            label: "Page ID"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/searchQuery",
        label: "Search Query"
      },
      {
        type: "Control",
        scope: "#/properties/filter",
        label: "Filter (JSON)"
      },
      {
        type: "Control",
        scope: "#/properties/sorts",
        label: "Sorts (JSON)"
      },
      {
        type: "Control",
        scope: "#/properties/pageSize",
        label: "Page Size"
      }
    ]
  },
  data: {
    resource: "databases",
    operation: "list",
    pageSize: 100
  }
};

// src/jira/formConfig.json
var formConfig_default27 = {
  schema: {
    type: "object",
    properties: {
      host: {
        type: "string",
        description: "Jira instance URL (e.g., https://your-domain.atlassian.net)",
        minLength: 1
      },
      email: {
        type: "string",
        description: "Atlassian account email",
        minLength: 1
      },
      apiToken: {
        type: "string",
        description: "Jira API Token",
        format: "password",
        minLength: 1
      }
    },
    required: ["host", "email", "apiToken"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/host",
        label: "Jira URL"
      },
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/email",
            label: "Email"
          },
          {
            type: "Control",
            scope: "#/properties/apiToken",
            label: "API Token",
            options: { format: "password" }
          }
        ]
      }
    ]
  },
  data: {
    host: "",
    email: "",
    apiToken: ""
  }
};

// src/jira/queryConfig.json
var queryConfig_default27 = {
  schema: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        enum: ["issues", "projects", "users", "boards", "sprints"],
        default: "issues"
      },
      operation: {
        type: "string",
        enum: ["search", "get", "create", "update"],
        default: "search"
      },
      jql: {
        type: "string",
        description: "JQL query for issue search"
      },
      issueKey: {
        type: "string",
        description: "Issue key (e.g., PROJ-123)"
      },
      projectKey: {
        type: "string",
        description: "Project key"
      },
      fields: {
        type: "string",
        description: "Fields to return (comma-separated)"
      },
      maxResults: {
        type: "integer",
        description: "Maximum results",
        default: 50,
        minimum: 1,
        maximum: 100
      },
      startAt: {
        type: "integer",
        description: "Start index for pagination",
        default: 0
      }
    },
    required: ["resource", "operation"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/resource",
            label: "Resource"
          },
          {
            type: "Control",
            scope: "#/properties/operation",
            label: "Operation"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/jql",
        label: "JQL Query"
      },
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/issueKey",
            label: "Issue Key"
          },
          {
            type: "Control",
            scope: "#/properties/projectKey",
            label: "Project Key"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/fields",
        label: "Fields"
      },
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/maxResults",
            label: "Max Results"
          },
          {
            type: "Control",
            scope: "#/properties/startAt",
            label: "Start At"
          }
        ]
      }
    ]
  },
  data: {
    resource: "issues",
    operation: "search",
    jql: "project = PROJ ORDER BY created DESC",
    maxResults: 50,
    startAt: 0
  }
};

// src/googleanalytics/formConfig.json
var formConfig_default28 = {
  schema: {
    type: "object",
    properties: {
      propertyId: {
        type: "string",
        description: "Google Analytics 4 Property ID",
        minLength: 1
      },
      credentials: {
        type: "string",
        description: "Service Account credentials JSON",
        format: "code-json"
      }
    },
    required: ["propertyId"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/propertyId",
        label: "Property ID"
      },
      {
        type: "Control",
        scope: "#/properties/credentials",
        label: "Service Account Credentials (JSON)"
      }
    ]
  },
  data: {
    propertyId: "",
    credentials: ""
  }
};

// src/googleanalytics/queryConfig.json
var queryConfig_default28 = {
  schema: {
    type: "object",
    properties: {
      reportType: {
        type: "string",
        enum: ["runReport", "runRealtimeReport"],
        default: "runReport"
      },
      dateRanges: {
        type: "array",
        description: "Date ranges for the report",
        items: {
          type: "object",
          properties: {
            startDate: { type: "string" },
            endDate: { type: "string" }
          }
        }
      },
      dimensions: {
        type: "array",
        description: "Dimensions to include",
        items: {
          type: "object",
          properties: {
            name: { type: "string" }
          }
        }
      },
      metrics: {
        type: "array",
        description: "Metrics to include",
        items: {
          type: "object",
          properties: {
            name: { type: "string" }
          }
        }
      },
      limit: {
        type: "integer",
        description: "Maximum rows to return",
        default: 1e4
      }
    },
    required: ["reportType"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/reportType",
        label: "Report Type"
      },
      {
        type: "Control",
        scope: "#/properties/dateRanges",
        label: "Date Ranges"
      },
      {
        type: "Control",
        scope: "#/properties/dimensions",
        label: "Dimensions"
      },
      {
        type: "Control",
        scope: "#/properties/metrics",
        label: "Metrics"
      },
      {
        type: "Control",
        scope: "#/properties/limit",
        label: "Row Limit"
      }
    ]
  },
  data: {
    reportType: "runReport",
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "activeUsers" }, { name: "sessions" }],
    limit: 1e4
  }
};

// src/index.js
var DATASOURCE_TYPES = {
  POSTGRESQL: {
    name: "PostgreSQL",
    value: "postgresql",
    icon: "SiPostgresql",
    iconColor: "#336791",
    formConfig: formConfig_default,
    queryConfigForm: queryConfig_default
  },
  RESTAPI: {
    name: "REST API",
    value: "restapi",
    icon: "TbApi",
    iconColor: "#10b981",
    formConfig: formConfig_default2,
    queryConfigForm: queryConfig_default2
  },
  WEB_URL: {
    name: "Web URL",
    value: "weburl",
    icon: "TbWorldWww",
    iconColor: "#3b82f6",
    formConfig: formConfig_default3,
    queryConfigForm: queryConfig_default3
  },
  FIRESTORE: {
    name: "Firestore",
    value: "firestore",
    icon: "SiFirebase",
    iconColor: "#FFCA28",
    formConfig: formConfig_default4,
    queryConfigForm: queryConfig_default4
  },
  MYSQL: {
    name: "MySQL",
    value: "mysql",
    icon: "SiMysql",
    iconColor: "#4479A1",
    formConfig: formConfig_default5,
    queryConfigForm: queryConfig_default5
  },
  MONGODB: {
    name: "MongoDB",
    value: "mongodb",
    icon: "SiMongodb",
    iconColor: "#47A248",
    formConfig: formConfig_default6,
    queryConfigForm: queryConfig_default6
  },
  GOOGLESHEETS: {
    name: "Google Sheets",
    value: "googlesheets",
    icon: "SiGooglesheets",
    iconColor: "#0F9D58",
    formConfig: formConfig_default7,
    queryConfigForm: queryConfig_default7
  },
  GRAPHQL: {
    name: "GraphQL",
    value: "graphql",
    icon: "SiGraphql",
    iconColor: "#E10098",
    formConfig: formConfig_default8,
    queryConfigForm: queryConfig_default8
  },
  RABBITMQ: {
    name: "RabbitMQ",
    value: "rabbitmq",
    icon: "SiRabbitmq",
    iconColor: "#FF6600",
    formConfig: formConfig_default9,
    queryConfigForm: queryConfig_default9
  },
  KAFKA: {
    name: "Kafka",
    value: "kafka",
    icon: "SiApachekafka",
    iconColor: "#231F20",
    formConfig: formConfig_default10,
    queryConfigForm: queryConfig_default10
  },
  REDIS: {
    name: "Redis",
    value: "redis",
    icon: "SiRedis",
    iconColor: "#DC382D",
    formConfig: formConfig_default11,
    queryConfigForm: queryConfig_default11
  },
  // Batch 1 datasources
  MSSQL: {
    name: "Microsoft SQL Server",
    value: "mssql",
    icon: "SiMicrosoftsqlserver",
    iconColor: "#CC2927",
    formConfig: formConfig_default12,
    queryConfigForm: queryConfig_default12
  },
  SUPABASE: {
    name: "Supabase",
    value: "supabase",
    icon: "SiSupabase",
    iconColor: "#3ECF8E",
    formConfig: formConfig_default13,
    queryConfigForm: queryConfig_default13
  },
  BIGQUERY: {
    name: "BigQuery",
    value: "bigquery",
    icon: "SiGooglebigquery",
    iconColor: "#4285F4",
    formConfig: formConfig_default14,
    queryConfigForm: queryConfig_default14
  },
  AIRTABLE: {
    name: "Airtable",
    value: "airtable",
    icon: "SiAirtable",
    iconColor: "#18BFFF",
    formConfig: formConfig_default15,
    queryConfigForm: queryConfig_default15
  },
  S3: {
    name: "AWS S3",
    value: "s3",
    icon: "SiAmazons3",
    iconColor: "#569A31",
    formConfig: formConfig_default16,
    queryConfigForm: queryConfig_default16
  },
  ELASTICSEARCH: {
    name: "Elasticsearch",
    value: "elasticsearch",
    icon: "SiElasticsearch",
    iconColor: "#005571",
    formConfig: formConfig_default17,
    queryConfigForm: queryConfig_default17
  },
  STRIPE: {
    name: "Stripe",
    value: "stripe",
    icon: "SiStripe",
    iconColor: "#635BFF",
    formConfig: formConfig_default18,
    queryConfigForm: queryConfig_default18
  },
  // Batch 2 datasources
  ORACLE: {
    name: "Oracle",
    value: "oracle",
    icon: "SiOracle",
    iconColor: "#F80000",
    formConfig: formConfig_default19,
    queryConfigForm: queryConfig_default19
  },
  SQLITE: {
    name: "SQLite",
    value: "sqlite",
    icon: "SiSqlite",
    iconColor: "#003B57",
    formConfig: formConfig_default20,
    queryConfigForm: queryConfig_default20
  },
  COCKROACHDB: {
    name: "CockroachDB",
    value: "cockroachdb",
    icon: "SiCockroachlabs",
    iconColor: "#6933FF",
    formConfig: formConfig_default21,
    queryConfigForm: queryConfig_default21
  },
  NEO4J: {
    name: "Neo4j",
    value: "neo4j",
    icon: "SiNeo4j",
    iconColor: "#008CC1",
    formConfig: formConfig_default22,
    queryConfigForm: queryConfig_default22
  },
  TWILIO: {
    name: "Twilio",
    value: "twilio",
    icon: "SiTwilio",
    iconColor: "#F22F46",
    formConfig: formConfig_default23,
    queryConfigForm: queryConfig_default23
  },
  SENDGRID: {
    name: "SendGrid",
    value: "sendgrid",
    icon: "SiSendgrid",
    iconColor: "#1A82E2",
    formConfig: formConfig_default24,
    queryConfigForm: queryConfig_default24
  },
  SLACK: {
    name: "Slack",
    value: "slack",
    icon: "SiSlack",
    iconColor: "#4A154B",
    formConfig: formConfig_default25,
    queryConfigForm: queryConfig_default25
  },
  NOTION: {
    name: "Notion",
    value: "notion",
    icon: "SiNotion",
    iconColor: "#000000",
    formConfig: formConfig_default26,
    queryConfigForm: queryConfig_default26
  },
  JIRA: {
    name: "Jira",
    value: "jira",
    icon: "SiJira",
    iconColor: "#0052CC",
    formConfig: formConfig_default27,
    queryConfigForm: queryConfig_default27
  },
  GOOGLEANALYTICS: {
    name: "Google Analytics",
    value: "googleanalytics",
    icon: "SiGoogleanalytics",
    iconColor: "#E37400",
    formConfig: formConfig_default28,
    queryConfigForm: queryConfig_default28
  }
};
var getDatasourceTypeByValue = (value) => {
  return Object.values(DATASOURCE_TYPES).find((type) => type.value === value);
};
export {
  DATASOURCE_TYPES,
  getDatasourceTypeByValue
};
//# sourceMappingURL=index.mjs.map
