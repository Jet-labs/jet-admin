import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { Plus, Trash2 } from "lucide-react";
import { useConfigValue } from "../config";

const INPUT_TYPES = ["string", "number", "boolean", "object", "array"];

const countLayoutNodes = (node) => {
  if (!node || typeof node !== "object") return 0;
  return (
    1 +
    (Array.isArray(node.children)
      ? node.children.reduce((sum, child) => sum + countLayoutNodes(child), 0)
      : 0)
  );
};

export const CompositeConfigEditor = () => {
  const [composite, setComposite] = useConfigValue("composite", {
    schemaVersion: 1,
    layout: null,
    inputs: [],
    outputs: [],
    values: {},
  });

  const update = useCallback(
    (patch) => {
      setComposite({
        schemaVersion: 1,
        layout: composite?.layout || null,
        inputs: composite?.inputs || [],
        outputs: composite?.outputs || [],
        values: composite?.values || {},
        ...(composite || {}),
        ...patch,
      });
    },
    [composite, setComposite]
  );

  const inputs = composite?.inputs || [];
  const outputs = composite?.outputs || [];

  const updateInput = (index, patch) => {
    const next = inputs.map((input, itemIndex) =>
      itemIndex === index ? { ...input, ...patch } : input
    );
    update({ inputs: next });
  };

  const updateOutput = (index, patch) => {
    const next = outputs.map((output, itemIndex) =>
      itemIndex === index ? { ...output, ...patch } : output
    );
    update({ outputs: next });
  };

  return (
    <div className="flex flex-col gap-3 p-2">
      <div className="rounded border border-border bg-muted/20 p-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Composite layout
        </p>
        {composite?.layout ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {countLayoutNodes(composite.layout)} captured layout node(s). Edit the
            layout by recreating the composite from a canvas selection.
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            No layout captured yet. Select a row/container/stack in the page canvas
            and use “Create composite widget”.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded border border-border bg-background p-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-foreground">Inputs</p>
            <p className="text-[10px] text-muted-foreground">
              Child widgets can read these as{" "}
              <code className="font-mono">
                {"{{ state.composite.inputs.key }}"}
              </code>
              .
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-[11px]"
            onClick={() =>
              update({
                inputs: [
                  ...inputs,
                  { key: `input${inputs.length + 1}`, type: "string", default: "" },
                ],
              })
            }
          >
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {inputs.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No typed inputs yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {inputs.map((input, index) => (
              <div key={`${input.key}-${index}`} className="grid grid-cols-[1fr_100px_1fr_auto] gap-1">
                <Input
                  value={input.key || ""}
                  onChange={(event) => updateInput(index, { key: event.target.value })}
                  placeholder="key"
                  className="h-7 font-mono text-[11px]"
                  aria-label={`Input ${index + 1} key`}
                />
                <Select
                  value={input.type || "string"}
                  onValueChange={(value) => updateInput(index, { type: value })}
                >
                  <SelectTrigger className="h-7 text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INPUT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={input.default == null ? "" : String(input.default)}
                  onChange={(event) =>
                    updateInput(index, { default: event.target.value })
                  }
                  placeholder="default"
                  className="h-7 font-mono text-[11px]"
                  aria-label={`Input ${index + 1} default`}
                />
                <Button
                  type="button"
                  variant="destructive-ghost"
                  size="icon"
                  square
                  className="h-7 w-7"
                  onClick={() =>
                    update({ inputs: inputs.filter((_, itemIndex) => itemIndex !== index) })
                  }
                  aria-label={`Remove input ${input.key || index + 1}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded border border-border bg-background p-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-foreground">Outputs / events</p>
            <p className="text-[10px] text-muted-foreground">
              Declare the events this composite exposes. Child widgets can emit
              application events such as{" "}
              <code className="font-mono">composite:changed</code>.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-[11px]"
            onClick={() =>
              update({
                outputs: [...outputs, { key: `event${outputs.length + 1}`, description: "" }],
              })
            }
          >
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {outputs.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No declared outputs yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {outputs.map((output, index) => (
              <div key={`${output.key}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-1">
                <Input
                  value={output.key || ""}
                  onChange={(event) => updateOutput(index, { key: event.target.value })}
                  placeholder="event key"
                  className="h-7 font-mono text-[11px]"
                  aria-label={`Output ${index + 1} key`}
                />
                <Input
                  value={output.description || ""}
                  onChange={(event) =>
                    updateOutput(index, { description: event.target.value })
                  }
                  placeholder="description"
                  className="h-7 text-[11px]"
                  aria-label={`Output ${index + 1} description`}
                />
                <Button
                  type="button"
                  variant="destructive-ghost"
                  size="icon"
                  square
                  className="h-7 w-7"
                  onClick={() =>
                    update({ outputs: outputs.filter((_, itemIndex) => itemIndex !== index) })
                  }
                  aria-label={`Remove output ${output.key || index + 1}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

CompositeConfigEditor.propTypes = {};
