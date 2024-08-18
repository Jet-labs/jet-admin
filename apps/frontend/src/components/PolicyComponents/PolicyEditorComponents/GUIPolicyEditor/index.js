import { Grid } from "@mui/material";

import { DashboardPolicyEditor } from "../DashboardPolicyEditor";
import { GraphPolicyEditor } from "../GraphPolicyEditor";
import { QueryPolicyEditor } from "../QueryPolicyEditor";
import { TablePolicyEditor } from "../TablePolicyEditor";
import { JobPolicyEditor } from "../JobPolicyEditor";
import { AppConstantPolicyEditor } from "../AppConstantPolicyEditor";
import { SchemaPolicyEditor } from "../SchemaPolicyEditor";
import { PolicyObjectPolicyEditor } from "../PolicyObjectPolicyEditor";
import { AccountPolicyEditor } from "../AccountPolicyEditor";
import { TriggerPolicyEditor } from "../TriggerPolicyEditor";

export const GUIPolicyEditor = ({ policy, handleChange, containerClass }) => {
  return (
    <Grid
      item
      xs={12}
      sm={12}
      md={12}
      lg={12}
      key={"_policy"}
      className={containerClass}
    >
      {policy &&
        Object.keys(policy).map((key) => {
          let component = null;
          switch (key) {
            case "tables": {
              component = (
                <TablePolicyEditor
                  value={policy[key]}
                  handleChange={(value) => {
                    handleChange({ ...policy, [key]: value });
                  }}
                />
              );
              break;
            }
            case "graphs": {
              component = (
                <GraphPolicyEditor
                  value={policy[key]}
                  handleChange={(value) => {
                    handleChange({ ...policy, [key]: value });
                  }}
                />
              );
              break;
            }
            case "queries": {
              component = (
                <QueryPolicyEditor
                  value={policy[key]}
                  handleChange={(value) => {
                    handleChange({ ...policy, [key]: value });
                  }}
                />
              );
              break;
            }
            case "dashboards": {
              component = (
                <DashboardPolicyEditor
                  value={policy[key]}
                  handleChange={(value) => {
                    handleChange({ ...policy, [key]: value });
                  }}
                />
              );
              break;
            }
            case "jobs": {
              component = (
                <JobPolicyEditor
                  value={policy[key]}
                  handleChange={(value) => {
                    handleChange({ ...policy, [key]: value });
                  }}
                />
              );
              break;
            }
            case "schemas": {
              component = (
                <SchemaPolicyEditor
                  value={policy[key]}
                  handleChange={(value) => {
                    handleChange({ ...policy, [key]: value });
                  }}
                />
              );
              break;
            }
            case "app_constants": {
              component = (
                <AppConstantPolicyEditor
                  value={policy[key]}
                  handleChange={(value) => {
                    handleChange({ ...policy, [key]: value });
                  }}
                />
              );
              break;
            }
            case "policies": {
              component = (
                <PolicyObjectPolicyEditor
                  value={policy[key]}
                  handleChange={(value) => {
                    handleChange({ ...policy, [key]: value });
                  }}
                />
              );
              break;
            }
            case "accounts": {
              component = (
                <AccountPolicyEditor
                  value={policy[key]}
                  handleChange={(value) => {
                    handleChange({ ...policy, [key]: value });
                  }}
                />
              );
              break;
            }
            case "triggers": {
              component = (
                <TriggerPolicyEditor
                  value={policy[key]}
                  handleChange={(value) => {
                    handleChange({ ...policy, [key]: value });
                  }}
                />
              );
              break;
            }
          }
          return component;
        })}
    </Grid>
  );
};
