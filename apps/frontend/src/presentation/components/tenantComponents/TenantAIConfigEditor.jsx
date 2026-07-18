import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Section, Button } from "@jet-admin/ui";
import { JsonForms } from "@jsonforms/react";
import { jetFormsRenderers } from "@jet-admin/json-forms-renderers";
import { getTenantAIConfigAPI, updateTenantAIConfigAPI } from "../../../data/apis/tenant";
import { displayError, displaySuccess } from "../../../utils/notification";

const schema = {
  type: "object",
  properties: {
    provider: {
      type: "string",
      enum: ["openai", "google"],
      title: "Provider",
    },
    model: {
      type: "string",
      title: "Model Name",
    },
    baseURL: {
      type: "string",
      title: "Base URL (Optional)",
    },
    apiKey: {
      type: "string",
      title: "API Key",
    },
  },
  required: ["provider", "model"],
};

const uischema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "HorizontalLayout",
      elements: [
        {
          type: "Control",
          scope: "#/properties/provider",
        },
        {
          type: "Control",
          scope: "#/properties/model",
        },
      ],
    },
    {
      type: "Control",
      scope: "#/properties/baseURL",
      rule: {
        effect: "HIDE",
        condition: {
          scope: "#/properties/provider",
          schema: {
            const: "google",
          },
        },
      },
    },
    {
      type: "Control",
      scope: "#/properties/apiKey",
      options: {
        format: "password",
      },
    },
  ],
};

export const TenantAIConfigEditor = ({ tenantID }) => {
  const queryClient = useQueryClient();

  const { data: aiConfig, isLoading } = useQuery({
    queryKey: ["TENANT_AI_CONFIG", tenantID],
    queryFn: () => getTenantAIConfigAPI({ tenantID }),
  });

  const { isPending: isUpdating, mutate: updateConfig } = useMutation({
    mutationFn: (data) => updateTenantAIConfigAPI({ tenantID, ...data }),
    onSuccess: () => {
      displaySuccess("AI Configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["TENANT_AI_CONFIG", tenantID] });
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    if (aiConfig) {
      setFormData({
        provider: aiConfig.provider || "openai",
        model: aiConfig.model || "",
        baseURL: aiConfig.baseURL || "",
        apiKey: aiConfig.apiKey || "",
      });
    }
  }, [aiConfig]);

  const handleChange = useCallback(({ data, errors }) => {
    setFormData(data || {});
    setFormErrors(errors || []);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      if (e) e.preventDefault();
      if (formErrors.length === 0) {
        updateConfig(formData);
      }
    },
    [formData, formErrors, updateConfig]
  );

  return (
    <Section title="AI Configuration" description="Configure the AI provider for this tenant.">
      <div className="space-y-2">
        <JsonForms
          schema={schema}
          uischema={uischema}
          data={formData}
          renderers={jetFormsRenderers}
          onChange={handleChange}
        />
        <div className="pt-2">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isUpdating || isLoading || formErrors.length > 0}
            size="sm"
          >
            Save Configuration
          </Button>
        </div>
      </div>
    </Section>
  );
};

TenantAIConfigEditor.propTypes = {
  tenantID: PropTypes.string.isRequired,
};
