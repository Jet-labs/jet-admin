/**
 * Data Collection Node
 *
 * Suspends the workflow and waits for a human (or an API) to provide data.
 *
 * The node configurator lets the author define form fields via a friendly
 * field-builder UI. These are converted to JSON Schema + JSON-Forms UISchema
 * and stored in nodeConfig. The handler resolves any mustache templates at
 * runtime before creating the suspension record.
 */

import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { useWorkflowNodes, useNodeExecutionStatus } from '../context';
import { getStatusStyles, StatusIndicator } from '../StatusIndicator';
import { FileText, Plus, Trash2, ArrowRightToLine, Ban } from 'lucide-react';
import {
    Button,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Checkbox,
    Label,
    Textarea,
} from '@jet-admin/ui';

// ─── Field types that map to JSON Schema + JSON-Forms UISchema ─────────────

const FIELD_TYPES = [
    { value: 'text', label: 'Text', schemaType: 'string' },
    { value: 'textarea', label: 'Long text', schemaType: 'string' },
    { value: 'number', label: 'Number', schemaType: 'number' },
    { value: 'boolean', label: 'Checkbox', schemaType: 'boolean' },
    { value: 'select', label: 'Dropdown', schemaType: 'string' },
];

const COLLECTION_TYPES = [
    { value: 'form', label: 'UI Form' },
    { value: 'api', label: 'API call (coming soon)', disabled: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Convert the friendly field list to a JSON Schema + JSON-Forms UISchema pair. */
function buildSchemas(fields) {
    const properties = {};
    const required = [];
    const elements = [];

    for (const f of fields) {
        if (!f.key) continue;
        const ft = FIELD_TYPES.find(t => t.value === f.fieldType) || FIELD_TYPES[0];

        const schemaProp = { type: ft.schemaType, title: f.label || f.key };
        if (f.fieldType === 'select' && f.options) {
            schemaProp.enum = f.options.split(',').map(o => o.trim()).filter(Boolean);
        }
        properties[f.key] = schemaProp;

        if (f.required) required.push(f.key);

        const uiControl = { type: 'Control', scope: `#/properties/${f.key}` };
        if (f.fieldType === 'textarea') uiControl.options = { multi: true, rows: 3 };
        if (f.placeholder) uiControl.options = { ...(uiControl.options ?? {}), placeholder: f.placeholder };
        elements.push(uiControl);
    }

    return {
        formSchema: {
            type: 'object',
            properties,
            ...(required.length ? { required } : {}),
        },
        formUischema: { type: 'VerticalLayout', elements },
    };
}

const makeField = () => ({
    id: uuidv4(),
    key: '',
    label: '',
    fieldType: 'text',
    required: false,
    placeholder: '',
    options: '',      // comma-separated, for select type only
});

// ═══════════════════════════════════════════════════════════════════════════
// Configurator
// ═══════════════════════════════════════════════════════════════════════════

export const DataCollectionNodeConfigurator = ({ data, onChange, nodeId }) => {
    const [title, setTitle] = useState(data?.title ?? 'Input required');
    const [description, setDescription] = useState(data?.description ?? '');
    const [collectionType, setCollectionType] = useState(data?.collectionType ?? 'form');
    const [fields, setFields] = useState(data?.fields ?? [makeField()]);
    const [outputVariable, setOutputVariable] = useState(data?.outputVariable ?? 'collectedData');
    const [expiryMinutes, setExpiryMinutes] = useState(data?.expiryMinutes ?? 60);

    useEffect(() => {
        if (!data) return;
        setTitle(data.title ?? 'Input required');
        setDescription(data.description ?? '');
        setCollectionType(data.collectionType ?? 'form');
        setFields(data.fields ?? [makeField()]);
        setOutputVariable(data.outputVariable ?? 'collectedData');
        setExpiryMinutes(data.expiryMinutes ?? 60);
    }, [data]);

    const addField = useCallback(() => setFields(prev => [...prev, makeField()]), []);
    const removeField = useCallback((id) => setFields(prev => prev.filter(f => f.id !== id)), []);
    const updateField = useCallback((id, patch) =>
        setFields(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f)), []);

    const handleSave = useCallback(() => {
        const { formSchema, formUischema } = buildSchemas(fields);
        onChange({
            title,
            description,
            collectionType,
            fields,
            formSchema,
            formUischema,
            outputVariable,
            expiryMinutes: Number(expiryMinutes) || 60,
        });
    }, [title, description, collectionType, fields, outputVariable, expiryMinutes, onChange]);

    return (
        <div className="w-full space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Modal title
                </Label>
                <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Input required"
                    className="h-8 text-sm"
                />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Instructions
                </Label>
                <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Tell the user what to fill in..."
                    className="w-full text-xs text-foreground border border-border rounded-md px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-brand-dark transition-colors"
                />
            </div>

            {/* Collection type */}
            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Collection method
                </Label>
                <Select value={collectionType} onValueChange={setCollectionType}>
                    <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {COLLECTION_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value} disabled={t.disabled} className="text-xs">
                                {t.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Form fields builder */}
            {collectionType === 'form' && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Form fields
                        </Label>
                        <Button type="button" variant="ghost" size="sm" onClick={addField}
                            className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10">
                            <Plus className="w-2.5 h-2.5 mr-1" /> Add field
                        </Button>
                    </div>

                    {fields.length === 0 && (
                        <p className="text-[10px] text-muted-foreground italic">No fields yet.</p>
                    )}

                    {fields.map((field, idx) => (
                        <div key={field.id}
                            className="rounded-md border border-border p-3 bg-muted/20 space-y-2">
                            <div className="flex gap-2 items-center">
                                <div className="flex-1">
                                    <Label className="text-[9px] text-muted-foreground">Key</Label>
                                    <Input
                                        value={field.key}
                                        onChange={e => updateField(field.id, { key: e.target.value.replace(/\s/g, '_') })}
                                        placeholder="field_name"
                                        className="h-7 text-xs font-mono"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label className="text-[9px] text-muted-foreground">Label</Label>
                                    <Input
                                        value={field.label}
                                        onChange={e => updateField(field.id, { label: e.target.value })}
                                        placeholder="Display label"
                                        className="h-7 text-xs"
                                    />
                                </div>
                                <Button type="button" variant="destructive-ghost" size="sm" square
                                    onClick={() => removeField(field.id)}
                                    className="h-7 w-7 mt-4 flex-shrink-0" disabled={fields.length === 1}>
                                    <Trash2 className="w-2.5 h-2.5" />
                                </Button>
                            </div>

                            <div className="flex gap-2 items-center">
                                <div className="flex-1">
                                    <Label className="text-[9px] text-muted-foreground">Type</Label>
                                    <Select
                                        value={field.fieldType}
                                        onValueChange={val => updateField(field.id, { fieldType: val })}>
                                        <SelectTrigger className="h-7 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FIELD_TYPES.map(t => (
                                                <SelectItem key={t.value} value={t.value} className="text-xs">
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Label className="text-[9px] text-muted-foreground">Placeholder</Label>
                                    <Input
                                        value={field.placeholder}
                                        onChange={e => updateField(field.id, { placeholder: e.target.value })}
                                        placeholder="Optional hint"
                                        className="h-7 text-xs"
                                    />
                                </div>
                                <label className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0 mt-4">
                                    <Checkbox
                                        checked={field.required}
                                        onCheckedChange={v => updateField(field.id, { required: v })}
                                    />
                                    Req.
                                </label>
                            </div>

                            {field.fieldType === 'select' && (
                                <div>
                                    <Label className="text-[9px] text-muted-foreground">
                                        Options <span className="text-muted-foreground/50">(comma-separated)</span>
                                    </Label>
                                    <Input
                                        value={field.options}
                                        onChange={e => updateField(field.id, { options: e.target.value })}
                                        placeholder="Option A, Option B, Option C"
                                        className="h-7 text-xs"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Output variable */}
            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Output variable
                </Label>
                <Input
                    value={outputVariable}
                    onChange={e => setOutputVariable(e.target.value.replace(/\s/g, ''))}
                    placeholder="collectedData"
                    className="h-8 text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                    Access via{' '}
                    <code className="bg-muted px-1 rounded-sm font-mono">
                        {`{{ctx.${outputVariable || 'collectedData'}}}`}
                    </code>
                </p>
            </div>

            {/* Expiry */}
            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Expiry (minutes) — 0 = never
                </Label>
                <Input
                    type="number"
                    value={expiryMinutes}
                    min={0}
                    onChange={e => setExpiryMinutes(e.target.value)}
                    className="h-8 text-xs w-28"
                />
            </div>

            {/* Help callout */}
            <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-[10px] text-primary/80 space-y-1">
                <div className="font-semibold text-xs text-primary">Suspend &amp; resume</div>
                <div>
                    When this node runs, the workflow <strong>pauses</strong> and a form
                    modal appears in the execution panel. The DAG only advances once the
                    user clicks <em>Submit &amp; continue</em>.
                </div>
                <div>
                    Field values land in{' '}
                    <code className="bg-brand-dark px-1 rounded-sm border border-border font-mono">
                        {`ctx.${outputVariable || 'collectedData'}`}
                    </code>{' '}
                    as a plain object.
                </div>
            </div>

            <Button type="button" size="sm" onClick={handleSave} className="w-full">
                Save
            </Button>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// Canvas card
// ═══════════════════════════════════════════════════════════════════════════

export const DataCollectionNode = memo(({ id, data, isConnectable }) => {
    const { nodeExecutionStatus } = useWorkflowNodes();
    const executionStatus = nodeExecutionStatus?.[id] || 'idle';
    const isDisabled = data?.isDisabled ?? false;
    const fieldCount = (data?.fields ?? []).filter(f => f.key).length;

    const isSuspended = executionStatus === 'suspended';

    const borderClass = isSuspended
        ? 'border-amber-400 ring-2 ring-amber-300 ring-opacity-60 animate-pulse'
        : getStatusStyles(executionStatus, 'violet-400');

    return (
        <div className={`
      relative bg-brand-black border rounded
      min-w-[300px] max-w-[380px]
      transition-all duration-150
      ${isDisabled ? 'border-brand-border opacity-50' : borderClass}
    `}>
            <StatusIndicator executionStatus={executionStatus} />

            <div className="flex items-stretch">
                {/* Left icon strip */}
                <div
                    style={{ borderTopLeftRadius: '0.25rem', borderBottomLeftRadius: '0.25rem' }}
                    className={`
            flex flex-col items-center justify-center px-3 py-3 border-r
            ${isDisabled ? 'bg-brand-dark border-brand-border' :
                            isSuspended ? 'bg-amber-100 border-amber-800' :
                                executionStatus === 'running' ? 'bg-blue-950/40 border-blue-800' :
                                    executionStatus === 'completed' ? 'bg-green-950/40 border-green-800' :
                                        executionStatus === 'failed' ? 'bg-red-950/40 border-red-800' :
                                            'bg-violet-50 border-violet-100'}
          `}
                >
                    {isSuspended
                        ? <ArrowRightToLine className="w-5 h-5 text-amber-600" />
                        : <FileText className={`w-5 h-5 ${isDisabled ? 'text-brand-text-primary' :
                                executionStatus === 'running' ? 'text-blue-600' :
                                    executionStatus === 'completed' ? 'text-green-600' :
                                        executionStatus === 'failed' ? 'text-red-600' :
                                            'text-violet-500'
                            }`} />
                    }
                </div>

                {/* Centre */}
                <div className="flex-1 px-3 py-2 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-semibold truncate
              ${isDisabled ? 'text-brand-text-primary line-through' : 'text-brand-text-primary'}`}>
                            {data?.title || 'Data collection'}
                        </span>
                        {isSuspended && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-sm border border-amber-800 whitespace-nowrap">
                                ⏸ Waiting
                            </span>
                        )}
                        {isDisabled && !isSuspended && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-sm border border-orange-800">
                                <Ban className="w-2.5 h-2.5" />
                                Skip
                            </span>
                        )}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isDisabled ? 'text-brand-text-primary' : 'text-brand-text-primary'}`}>
                        {fieldCount > 0
                            ? `${fieldCount} field${fieldCount !== 1 ? 's' : ''} · saves to ctx.${data?.outputVariable || 'collectedData'}`
                            : 'No fields defined yet'}
                    </div>
                </div>

                {/* Right handle indicators */}
                <div className="flex flex-col items-center justify-center px-2 border-l border-brand-border">
                    <div className={`w-2 h-2 rounded-full mb-1
            ${isSuspended ? 'bg-amber-400 animate-pulse' : isDisabled ? 'bg-brand-black' : 'bg-violet-400'}`}
                        title="Output (after submission)" />
                    <div className={`w-2 h-2 rounded-full ${isDisabled ? 'bg-brand-black' : 'bg-red-400'}`}
                        title="Error" />
                </div>
            </div>

            <Handle type="target" position={Position.Top} isConnectable={isConnectable}
                style={{ width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#8b5cf6', border: 'none', top: -5 }} />
            <Handle type="source" position={Position.Bottom} id="output" isConnectable={isConnectable}
                style={{ left: '35%', width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#8b5cf6', border: 'none', bottom: -5 }} />
            <Handle type="source" position={Position.Bottom} id="error" isConnectable={isConnectable}
                style={{ left: '65%', width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#ef4444', border: 'none', bottom: -5 }} />
        </div>
    );
});