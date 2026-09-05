import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Section, Button } from "@jet-admin/ui";
import { JsonForms } from "@jsonforms/react";
import { jetFormsRenderers } from "@jet-admin/json-forms-renderers";
import { getTenantAIConfigAPI, updateTenantAIConfigAPI } from "../../../data/apis/tenant";
import { displayError, displaySuccess } from "../../../utils/notification";

const JET_FREE_PRESET = {
  provider: "openrouter",
  model: "minimax/minimax-m3:free",
  baseURL: "https://openrouter.ai/api/v1",
};

const FREE_MODEL_OPTIONS = [
  "minimax/minimax-m3:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "z-ai/glm-5.2:free",
];

const schema = {
  type: "object",
  properties: {
    provider: {
      type: "string",
      enum: ["openai", "openrouter", "google"],
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
      title: "API Key (leave empty to use the workspace Jet key)",
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
    <Section title="AI Configuration" description="Configure the AI provider for this tenant. Jet works out of the box on the workspace free key — only set this to override it per tenant.">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 rounded border border-border bg-muted/20 p-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground">Jet Free Agent (Recommended)</p>
            <p className="text-[11px] text-muted-foreground truncate">
              OpenRouter · {JET_FREE_PRESET.model} · 1M context · tool-calling verified
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => setFormData((prev) => ({ ...prev, ...JET_FREE_PRESET }))}>
            Use Jet Free
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FREE_MODEL_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, model: m }))}
              className="text-[11px] font-mono px-2 py-1 rounded border border-border bg-background hover:border-primary/50 hover:text-primary transition-colors"
              title={`Use ${m}`}
            >
              {m}
            </button>
          ))}
        </div>
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
