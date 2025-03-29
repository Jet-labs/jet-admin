import * as Yup from "yup";
import { CONSTANTS } from "../constants";
export const formValidations = {};

formValidations.emailSignUpFormValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format")
    .trim(),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

formValidations.emailSignInFormValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format")
    .trim(),
  password: Yup.string().required("Password is required"),
});

formValidations.addTenantFormValidationSchema = Yup.object().shape({
  tenantName: Yup.string().required("Tenant name is required").trim(),
  tenantLogoURL: Yup.string()
    .required("Tenant logo URL is required")
    .url("Must be a valid URL")
    .trim(),
  tenantDBURL: Yup.string().url("Must be a valid URL"),
});

formValidations.updateTenantFormValidationSchema = Yup.object().shape({
  tenantID: Yup.string().required("Tenant ID is required"),
  tenantName: Yup.string().required("Tenant name is required").trim(),
  tenantLogoURL: Yup.string()
    .required("Tenant logo URL is required")
    .url("Must be a valid URL")
    .trim(),
  tenantDBURL: Yup.string().url("Must be a valid URL"),
});

formValidations.addUserToTenantFormValidationSchema = Yup.object().shape({
  tenantID: Yup.string().required("Tenant ID is required"),
  tenantUserEmail: Yup.string()
    .required("Email is required")
    .email("Invalid email format")
    .trim(),
});

formValidations.addTenantRoleFormValidationSchema = Yup.object().shape({
  roleName: Yup.string().required("Role name is required").trim(),
  roleDescription: Yup.string().required("Role description is required").trim(),
  permissionIDs: Yup.array().of(Yup.string()),
});

formValidations.updateTenantRoleFormValidationSchema = Yup.object().shape({
  roleName: Yup.string().required("Role name is required").trim(),
  roleDescription: Yup.string().required("Role description is required").trim(),
  permissionIDs: Yup.array().of(Yup.string()),
});

formValidations.addSchemaFormValidationSchema = Yup.object().shape({
  databaseSchemaName: Yup.string()
    .required("Schema name is required")
    .trim() // Removes leading/trailing whitespace
    .min(1, "Schema name cannot be empty"),
});

formValidations.addDashboardFormValidationSchema = Yup.object().shape({
  databaseDashboardName: Yup.string()
    .required("Dashboard name is required")
    .trim(),
  databaseDashboardDescription: Yup.string().trim(),
  databaseDashboardConfig: Yup.object().shape({
    widgets: Yup.array(),
    layouts: Yup.object(),
  }),
});

formValidations.updateDashboardFormValidationSchema = Yup.object().shape({
  databaseDashboardName: Yup.string()
    .required("Dashboard name is required")
    .trim(),
  databaseDashboardDescription: Yup.string().trim(),
  databaseDashboardConfig: Yup.object().shape({
    widgets: Yup.array(),
    layouts: Yup.object(),
  }),
});

formValidations.queryAdditionFormValidationSchema = Yup.object().shape({
  databaseQueryTitle: Yup.string()
    .required("Query title is required")
    .min(3, "Query title must be at least 3 characters"),
  databaseQueryDescription: Yup.string().optional(), // Optional field
  databaseQuery: Yup.string()
    .required("Database query is required")
    .min(10, "Database query must be at least 10 characters"),
  databaseQueryArgs: Yup.array()
    .of(
      Yup.string()
        .matches(
          /^\{[a-zA-Z0-9_]+\}$/,
          "Arguments must follow the format {argName}"
        )
        .required("Argument name is required")
    )
    .optional(), // Optional array of arguments
  runOnLoad: Yup.boolean(),
});

formValidations.queryUpdationFormValidationSchema = Yup.object().shape({
  databaseQueryTitle: Yup.string()
    .required("Query title is required")
    .min(3, "Query title must be at least 3 characters"),
  databaseQueryDescription: Yup.string().optional(), // Optional field
  databaseQuery: Yup.string()
    .required("Database query is required")
    .min(10, "Database query must be at least 10 characters"),
  databaseQueryArgs: Yup.array()
    .of(
      Yup.string()
        .matches(
          /^\{[a-zA-Z0-9_]+\}$/,
          "Arguments must follow the format {argName}"
        )
        .required("Argument name is required")
    )
    .optional(), // Optional array of arguments
  runOnLoad: Yup.boolean(),
});

formValidations.databaseNotificationAdditionFormValidationSchema =
  Yup.object().shape({
    databaseNotificationName: Yup.string().required(
      "Notification name is required"
    ),
  });

formValidations.databaseNotificationUpdationFormValidationSchema =
  Yup.object().shape({
    databaseNotificationName: Yup.string().required(
      "Notification name is required"
    ),
  });

formValidations.apiKeyAdditionFormValidationSchema = Yup.object().shape({
  apiKeyName: Yup.string().required("API key name is required"),
});

formValidations.apiKeyUpdationFormValidationSchema = Yup.object().shape({
  apiKeyName: Yup.string().required("API key name is required"),
});

formValidations.databaseQueryArgsFormValidationSchema = (args) =>
  Yup.object().shape(
    args.reduce((acc, arg) => {
      acc[arg] = Yup.string().required(`${arg} is required`);
      return acc;
    }, {})
  );

formValidations.datasetArgumentsFormValidationSchema = (args) => {
  const argsMapSchema = {};

  // Dynamically create validation rules for each argument
  args.forEach((arg) => {
    const argName = arg.replace(/[{}]/g, ""); // Remove curly braces if present
    argsMapSchema[argName] = Yup.string()
      .required(`Value for ${argName} is required`)
      .min(1, `Value for ${argName} cannot be empty`);
  });

  return Yup.object().shape({
    argsMap: Yup.object().shape(argsMapSchema),
  });
};

formValidations.datasetFieldMappingFormValidationSchema = (datasetFields) => {
  const datasetFieldsSchema = {};

  // Dynamically create validation rules for each field in datasetFields
  datasetFields.forEach((field) => {
    datasetFieldsSchema[field] = Yup.string()
      .required(`${field} is required`)
      .min(1, `${field} cannot be empty`);
  });

  return Yup.object().shape({
    datasetFields: Yup.object().shape(datasetFieldsSchema),
    argsMap: Yup.object(), // Optional, no specific validation for argsMap here
  });
};

formValidations.addDatabaseChartFormValidationSchema = Yup.object().shape({
  databaseChartName: Yup.string().required("Chart name is required"),
  databaseChartType: Yup.string().required("Chart type is required"),
  queries: Yup.array()
    .of(
      Yup.object().shape({
        databaseQueryID: Yup.string().required("Query is required"),
        title: Yup.string()
          .required("Alias is required")
          .test("unique-alias", "Alias must be unique", function (value) {
            const aliases = this.parent.map((q) => q.title);
            return aliases.filter((a) => a === value).length === 1;
          }),
      })
    )
    .min(1, "At least 1 query required"),
});

formValidations.updateDatabaseChartFormValidationSchema = Yup.object().shape({
  databaseChartName: Yup.string().required("Chart name is required"),
  databaseChartType: Yup.string().required("Chart type is required"),
  queries: Yup.array()
    .of(
      Yup.object().shape({
        databaseQueryID: Yup.string().required("Query is required"),
        title: Yup.string()
          .required("Alias is required")
          .test("unique-alias", "Alias must be unique", function (value) {
            const aliases = this.parent.map((q) => q.title);
            return aliases.filter((a) => a === value).length === 1;
          }),
      })
    )
    .min(1, "At least 1 query required"),
});

formValidations.datasetAdvancedOptionsFormValidationSchema = Yup.object().shape(
  {
    type: Yup.string()
      .required("Chart type is required")
      .oneOf(
        [
          CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value,
          CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value,
          CONSTANTS.DATABASE_CHART_TYPES.PIE_CHART.value,
          CONSTANTS.DATABASE_CHART_TYPES.BUBBLE_CHART.value,
        ],
        "Invalid chart type"
      ),
    xAxisID: Yup.string().required("X-axis ID is required"),
    yAxisID: Yup.string().required("Y-axis ID is required"),
    hidden: Yup.boolean(),
    order: Yup.number()
      .integer("Order must be an integer")
      .min(0, "Order must be non-negative"),
    clip: Yup.boolean(),

    // Element configuration
    backgroundColor: Yup.string().matches(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Invalid color format"
    ),
    borderColor: Yup.string().matches(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Invalid color format"
    ),
    borderWidth: Yup.number().min(0, "Border width must be non-negative"),
    borderDash: Yup.array().of(
      Yup.number().min(0, "Dash values must be non-negative")
    ),
    borderDashOffset: Yup.number().min(0, "Dash offset must be non-negative"),
    borderRadius: Yup.number().min(0, "Border radius must be non-negative"),
    hoverBackgroundColor: Yup.string().matches(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Invalid color format"
    ),
    hoverBorderColor: Yup.string().matches(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Invalid color format"
    ),
    hoverBorderWidth: Yup.number().min(
      0,
      "Hover border width must be non-negative"
    ),

    // Type-specific configurations
    tension: Yup.number()
      .min(0)
      .max(1)
      .when("type", {
        is: CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value,
        then: Yup.number().required("Tension is required for line charts"),
      }),
    stepped: Yup.boolean().when("type", {
      is: CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value,
      then: Yup.boolean().required("Stepped is required for line charts"),
    }),
    pointRadius: Yup.number()
      .min(0)
      .when("type", {
        is: CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value,
        then: Yup.number().required("Point radius is required for line charts"),
      }),
    pointStyle: Yup.string().when("type", {
      is: CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value,
      then: Yup.string().required("Point style is required for line charts"),
    }),
    fill: Yup.boolean().when("type", {
      is: CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value,
      then: Yup.boolean().required("Fill is required for line charts"),
    }),
    barPercentage: Yup.number()
      .min(0)
      .max(1)
      .when("type", {
        is: CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value,
        then: Yup.number().required(
          "Bar percentage is required for bar charts"
        ),
      }),
    barThickness: Yup.number()
      .min(0)
      .when("type", {
        is: CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value,
        then: Yup.number().required("Bar thickness is required for bar charts"),
      }),
    maxBarThickness: Yup.number()
      .min(0)
      .when("type", {
        is: CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value,
        then: Yup.number().required(
          "Max bar thickness is required for bar charts"
        ),
      }),
    rotation: Yup.number()
      .min(0)
      .max(360)
      .when("type", {
        is: CONSTANTS.DATABASE_CHART_TYPES.PIE_CHART.value,
        then: Yup.number().required("Rotation is required for pie charts"),
      }),
    cutout: Yup.number()
      .min(0)
      .max(100)
      .when("type", {
        is: CONSTANTS.DATABASE_CHART_TYPES.PIE_CHART.value,
        then: Yup.number().required("Cutout is required for pie charts"),
      }),
    radius: Yup.number()
      .min(0)
      .when("type", {
        is: CONSTANTS.DATABASE_CHART_TYPES.BUBBLE_CHART.value,
        then: Yup.number().required("Radius is required for bubble charts"),
      }),
    hitRadius: Yup.number()
      .min(0)
      .when("type", {
        is: CONSTANTS.DATABASE_CHART_TYPES.BUBBLE_CHART.value,
        then: Yup.number().required("Hit radius is required for bubble charts"),
      }),
  }
);

formValidations.tableAdditionFormValidationSchema = Yup.object().shape({
  databaseTableName: Yup.string().required("Table name is required"),
  databaseTableColumns: Yup.array().of(
    Yup.object().shape({
      databaseTableColumnName: Yup.string().required("Column name is required"),
      databaseTableColumnType: Yup.string().required("Data type is required"),
    })
  ),
  databaseTableConstraints: Yup.object().shape({
    foreignKeys: Yup.array().of(
      Yup.object().shape({
        referencedTable: Yup.string().required("Reference table is required"),
        referencedColumns: Yup.array().min(
          1,
          "At least one reference column required"
        ),
      })
    ),
  }),
});

formValidations.tableUpdationFormValidationSchema = Yup.object().shape({
  databaseTableName: Yup.string().required("Table name is required"),
  databaseTableColumns: Yup.array().of(
    Yup.object().shape({
      databaseTableColumnName: Yup.string().required("Column name is required"),
      databaseTableColumnType: Yup.string().required("Data type is required"),
    })
  ),
  databaseTableConstraints: Yup.object().shape({
    foreignKeys: Yup.array().of(
      Yup.object().shape({
        referencedTable: Yup.string().required("Reference table is required"),
        referencedColumns: Yup.array().min(
          1,
          "At least one reference column required"
        ),
      })
    ),
  }),
});

formValidations.triggerAdditionFormValidationSchema = Yup.object().shape({
  databaseTriggerName: Yup.string().required("Trigger name is required"),
  databaseTableName: Yup.string().required("Table name is required"),
  triggerFunctionName: Yup.string().required("Function name is required"),
  triggerEvents: Yup.array()
    .min(1, "At least one event must be selected")
    .required("Trigger events are required"),
  triggerTiming: Yup.string().required("Trigger timing is required"),
  forEach: Yup.string().required("For each option is required"),
});

formValidations.addDatabaseWidgetFormValidationSchema = Yup.object().shape({
  databaseWidgetName: Yup.string().required("Widget name is required"),
  databaseWidgetType: Yup.string().required("Widget type is required"),
  queries: Yup.array()
    .of(
      Yup.object().shape({
        databaseQueryID: Yup.string().required("Query is required"),
        title: Yup.string()
          .required("Alias is required")
          .test("unique-alias", "Alias must be unique", function (value) {
            const aliases = this.parent.map((q) => q.title);
            return aliases.filter((a) => a === value).length === 1;
          }),
      })
    )
    .min(1, "At least 1 query required"),
});

formValidations.updateDatabaseWidgetFormValidationSchema = Yup.object().shape({
  databaseWidgetName: Yup.string().required("Widget name is required"),
  databaseWidgetType: Yup.string().required("Widget type is required"),
  queries: Yup.array()
    .of(
      Yup.object().shape({
        databaseQueryID: Yup.string().required("Query is required"),
        title: Yup.string()
          .required("Alias is required")
          .test("unique-alias", "Alias must be unique", function (value) {
            const aliases = this.parent.map((q) => q.title);
            return aliases.filter((a) => a === value).length === 1;
          }),
      })
    )
    .min(1, "At least 1 query required"),
});
