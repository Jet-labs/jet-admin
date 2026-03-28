import React from "react";
import PropTypes from "prop-types";
import { Trash2, Plus } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { CodeEditor } from "./code-editor";
import { Badge } from "./badge";

/**
 * Comprehensive ArrayInput with typed item support.
 *
 * @param {{ value: any[], onChange: (arr: any[]) => void, disabled?: boolean, placeholder?: string, itemType?: 'string'|'number'|'object', maxItems?: number, minItems?: number }} props
 */
export function ArrayInput({
  value,
  onChange,
  disabled = false,
  placeholder = "Value",
  itemType = "string",
  maxItems,
  minItems,
}) {
  const currentArray = Array.isArray(value) ? value : [];

  const handleItemChange = (index, newValue) => {
    const newArray = [...currentArray];
    newArray[index] = newValue;
    onChange(newArray);
  };

  const handleRemoveItem = (index) => {
    const newArray = currentArray.filter((_, i) => i !== index);
    onChange(newArray);
  };

  const handleAddItem = () => {
    if (maxItems !== undefined && currentArray.length >= maxItems) return;
    const defaultValue = itemType === "number" ? 0 : itemType === "object" ? "{}" : "";
    onChange([...currentArray, defaultValue]);
  };

  const canAdd = maxItems === undefined || currentArray.length < maxItems;
  const canRemove =
    minItems === undefined || currentArray.length > minItems;

  const renderItem = (item, index) => {
    if (itemType === "object") {
      const displayValue =
        typeof item === "object" && item !== null
          ? JSON.stringify(item, null, 2)
          : typeof item === "string"
            ? item
            : JSON.stringify(item);

      return (
        <div key={index} className="flex gap-2 w-full">
          <div className="flex-1 min-w-0">
            <CodeEditor
              language="json"
              height={80}
              showHeader={false}
              showExpandButton={false}
              showFormatButton={false}
              showLineNumbers={false}
              value={displayValue}
              onChange={(val) => handleItemChange(index, val)}
              disabled={disabled}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            square
            className="h-8 w-8 text-slate-500 hover:text-red-500 flex-shrink-0 mt-1"
            onClick={() => handleRemoveItem(index)}
            disabled={disabled || !canRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    // string / number
    return (
      <div key={index} className="flex items-center gap-2 w-full">
        <Input
          className="flex-1 text-xs"
          type={itemType === "number" ? "number" : "text"}
          placeholder={placeholder}
          value={
            typeof item === "string" || typeof item === "number"
              ? item
              : JSON.stringify(item)
          }
          onChange={(e) => {
            const val =
              itemType === "number"
                ? e.target.value === ""
                  ? ""
                  : Number(e.target.value)
                : e.target.value;
            handleItemChange(index, val);
          }}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          square
          className="h-8 w-8 text-slate-500 hover:text-red-500 flex-shrink-0"
          onClick={() => handleRemoveItem(index)}
          disabled={disabled || !canRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-2 w-full">
      {currentArray.length > 0 ? (
        <div className="space-y-2">{currentArray.map(renderItem)}</div>
      ) : (
        <p className="text-xs text-slate-400 italic">No items added to array.</p>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8"
          onClick={handleAddItem}
          disabled={disabled || !canAdd}
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          Add Item
        </Button>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-5">
          {currentArray.length}{maxItems !== undefined ? ` / ${maxItems}` : ""}
        </Badge>
      </div>
    </div>
  );
}

ArrayInput.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  itemType: PropTypes.oneOf(["string", "number", "object"]),
  maxItems: PropTypes.number,
  minItems: PropTypes.number,
};
