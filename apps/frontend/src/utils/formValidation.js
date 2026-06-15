import * as Yup from "yup";
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
  tenantTitle: Yup.string().required("Tenant name is required").trim(),
});

formValidations.updateTenantFormValidationSchema = Yup.object().shape({
  tenantID: Yup.string().required("Tenant ID is required"),
  tenantTitle: Yup.string().required("Tenant name is required").trim(),
});

formValidations.addUserToTenantFormValidationSchema = Yup.object().shape({
  tenantID: Yup.string().required("Tenant ID is required"),
  tenantUserEmail: Yup.string()
    .required("Email is required")
    .email("Invalid email format")
    .trim(),
});

formValidations.addTenantRoleFormValidationSchema = Yup.object().shape({
  roleTitle: Yup.string().required("Role name is required").trim(),
  roleDescription: Yup.string().required("Role description is required").trim(),
  permissionIDs: Yup.array().of(Yup.string()),
  assetPermissions: Yup.array().of(
    Yup.object().shape({
      resourceType: Yup.string().required("Resource type is required"),
      resourceID: Yup.string().required("Resource ID is required"),
      action: Yup.string().required("Action is required"),
    })
  ),
});

formValidations.updateTenantRoleFormValidationSchema = Yup.object().shape({
  roleTitle: Yup.string().required("Role name is required").trim(),
  roleDescription: Yup.string().required("Role description is required").trim(),
  permissionIDs: Yup.array().of(Yup.string()),
  assetPermissions: Yup.array().of(
    Yup.object().shape({
      resourceType: Yup.string().required("Resource type is required"),
      resourceID: Yup.string().required("Resource ID is required"),
      action: Yup.string().required("Action is required"),
    })
  ),
});

formValidations.addDashboardFormValidationSchema = Yup.object().shape({
  dashboardTitle: Yup.string().required("Dashboard name is required").trim(),
  dashboardDescription: Yup.string().trim(),
  dashboardConfig: Yup.object().shape({
    widgets: Yup.array(),
    layouts: Yup.object(),
  }),
});

formValidations.updateDashboardFormValidationSchema = Yup.object().shape({
  dashboardTitle: Yup.string().required("Dashboard name is required").trim(),
  dashboardDescription: Yup.string().trim(),
  dashboardConfig: Yup.object().shape({
    widgets: Yup.array(),
    layouts: Yup.object(),
  }),
});

formValidations.addAppPageFormValidationSchema = Yup.object().shape({
  appPageTitle: Yup.string().required("App page name is required").trim(),
  appPageDescription: Yup.string().trim(),
  appPageConfig: Yup.object().shape({
    widgets: Yup.array(),
    layouts: Yup.object(),
  }),
});

formValidations.updateAppPageFormValidationSchema = Yup.object().shape({
  appPageTitle: Yup.string().required("App page name is required").trim(),
  appPageDescription: Yup.string().trim(),
  appPageConfig: Yup.object().shape({
    widgets: Yup.array(),
    layouts: Yup.object(),
  }),
});

formValidations.queryAdditionFormValidationSchema = Yup.object().shape({
  dataQueryTitle: Yup.string()
    .required("Query title is required")
    .min(3, "Query title must be at least 3 characters"),
  dataQueryInputs: Yup.array()
    .of(Yup.string().required("Argument name is required"))
    .optional(), // Optional array of arguments

});

formValidations.queryUpdationFormValidationSchema = Yup.object().shape({
  dataQueryTitle: Yup.string()
    .required("Query title is required")
    .min(3, "Query title must be at least 3 characters"),

  dataQueryInputs: Yup.array()
    .of(Yup.string().required("Argument name is required"))
    .optional(), // Optional array of arguments

});

formValidations.databaseNotificationAdditionFormValidationSchema =
  Yup.object().shape({
    databaseNotificationTitle: Yup.string().required(
      "Notification name is required"
    ),
  });

formValidations.databaseNotificationUpdationFormValidationSchema =
  Yup.object().shape({
    databaseNotificationTitle: Yup.string().required(
      "Notification name is required"
    ),
  });

formValidations.apiKeyAdditionFormValidationSchema = Yup.object().shape({
  apiKeyTitle: Yup.string().required("API key name is required"),
});

formValidations.apiKeyUpdationFormValidationSchema = Yup.object().shape({
  apiKeyTitle: Yup.string().required("API key name is required"),
});

formValidations.cronJobAdditionFormValidationSchema = Yup.object().shape({
  cronJobTitle: Yup.string().required("Scheduled job title is required"),
  cronJobDescription: Yup.string().optional(),
  cronJobSchedule: Yup.string().required("Schedule is required"),
  workflowID: Yup.string().required("Workflow is required"),
});

formValidations.cronJobUpdationFormValidationSchema = Yup.object().shape({
  cronJobTitle: Yup.string().required("Scheduled job title is required"),
  cronJobDescription: Yup.string().optional(),
  cronJobSchedule: Yup.string().required("Schedule is required"),
  workflowID: Yup.string().required("Workflow is required"),
});

formValidations.subscriptionAdditionFormValidationSchema = Yup.object().shape({
  subscriptionTitle: Yup.string().required("Subscription name is required"),
  datasourceID: Yup.string().required("Data source is required"),
  subscriptionType: Yup.string().required("Subscription type is required"),
  status: Yup.string().optional(),
  subscriptionConfig: Yup.string().optional(),
});

formValidations.subscriptionUpdationFormValidationSchema = Yup.object().shape({
  subscriptionTitle: Yup.string().required("Subscription name is required"),
  datasourceID: Yup.string().required("Data source is required"),
  subscriptionType: Yup.string().required("Subscription type is required"),
  status: Yup.string().optional(),
  subscriptionConfig: Yup.string().optional(),
});

formValidations.webhookAdditionFormValidationSchema = Yup.object().shape({
  webhookTitle: Yup.string().required("Webhook name is required"),
  webhookPath: Yup.string().required("Endpoint path is required"),
  authType: Yup.string().required("Authentication type is required"),
  status: Yup.string().optional(),
  authConfig: Yup.string().optional(),
});

formValidations.webhookUpdationFormValidationSchema = Yup.object().shape({
  webhookTitle: Yup.string().required("Webhook name is required"),
  webhookPath: Yup.string().required("Endpoint path is required"),
  authType: Yup.string().required("Authentication type is required"),
  status: Yup.string().optional(),
  authConfig: Yup.string().optional(),
});

formValidations.dataQueryInputsFormValidationSchema = (inputDefinitions) =>
  Yup.object().shape(
    inputDefinitions.reduce((acc, inputDef) => {
      acc[inputDef] = Yup.string().required(`${inputDef} is required`);
      return acc;
    }, {})
  );

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

formValidations.datasetAdvancedOptionsFormValidationSchema = Yup.object().shape(
  {
    type: Yup.string().required("Widget type is required"),
    xAxisID: Yup.string().required("X-axis ID is required"),
    yAxisID: Yup.string().required("Y-axis ID is required"),
    hidden: Yup.boolean(),
    order: Yup.number()
      .integer("Order must be an integer")
      .min(0, "Order must be non-negative"),
    clip: Yup.boolean(),

    // Element configuration
    // backgroundColor: Yup.string().matches(
    //   /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    //   "Invalid color format"
    // ),
    // borderColor: Yup.string().matches(
    //   /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    //   "Invalid color format"
    // ),
    // borderWidth: Yup.number().min(0, "Border width must be non-negative"),
    // borderDash: Yup.array().of(
    //   Yup.number().min(0, "Dash values must be non-negative")
    // ),
    // borderDashOffset: Yup.number().min(0, "Dash offset must be non-negative"),
    // borderRadius: Yup.number().min(0, "Border radius must be non-negative"),
    // hoverBackgroundColor: Yup.string().matches(
    //   /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    //   "Invalid color format"
    // ),
    // hoverBorderColor: Yup.string().matches(
    //   /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    //   "Invalid color format"
    // ),
    // hoverBorderWidth: Yup.number().min(
    //   0,
    //   "Hover border width must be non-negative"
    // ),
  }
);

formValidations.addWidgetFormValidationSchema = Yup.object().shape({
  widgetTitle: Yup.string().required("Widget name is required"),
  widgetType: Yup.string().required("Widget type is required"),
});

formValidations.updateWidgetFormValidationSchema = Yup.object().shape({
  widgetTitle: Yup.string().required("Widget name is required"),
  widgetType: Yup.string().required("Widget type is required"),
});

formValidations.datasourceAdditionFormValidationSchema = Yup.object().shape({
  datasourceName: Yup.string().required("Datasource name is required"),
  datasourceDescription: Yup.string().optional(),
  datasourceType: Yup.string().required("Datasource type is required"),
});

formValidations.workflowAdditionFormValidationSchema = Yup.object().shape({
  title: Yup.string().required("Workflow name is required"),
});

formValidations.workflowUpdationFormValidationSchema = Yup.object().shape({
  title: Yup.string().required("Workflow name is required"),
});
