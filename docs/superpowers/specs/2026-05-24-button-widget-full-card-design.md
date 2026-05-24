# Design Spec: Button Widget Layout & Header Refactoring

Refactoring the button widget implementation so that the button component occupies the entire layout grid card slot instead of being centered inside it with internal padding. Additionally, defaulting the header visibility of button widgets to hidden while preserving the user's ability to toggle it on.

## Goals

1. **Full-Size Button Widget**: Make the `Button` element inside `buttonWidget.jsx` fill the entire width and height of the widget slot.
2. **Default-Hidden Header**: Keep the header toggle functional in the editor, but default its value to `false` for button widgets so new buttons appear cleaner.
3. **Responsive Grid Alignment**: Ensure the button scales cleanly to any grid size.

---

## Detailed Component Changes

### 1. Widget Default Configuration
**File**: `packages/widgets-ui/src/widget.map.js`

Update the `sampleConfig` for `button` to default `showHeader` to `false`:
```javascript
  'button': {
    ...
    sampleConfig: {
      text: "Click Me",
      variant: "default",
      size: "default",
      showHeader: false, // Default to false
    },
  }
```

### 2. Widget Slot Padding Control
**File**: `apps/frontend/src/presentation/components/appPageComponents/appPageWidgetSlot.jsx`

Identify button widgets and conditionally remove the slot content padding so the button component can stretch up to the slot borders:
```javascript
const isButton = widget?.widgetType === "button";

// ...
{RenderedWidgetComponent ? (
  <div className={isButton ? "min-h-0 flex-1 bg-background h-full w-full" : "min-h-0 flex-1 bg-background px-2 pb-2 pt-1"}>
    <MemoizedWidgetContent ... />
  </div>
) : null}
```

### 3. Button Widget Component Update
**File**: `packages/widgets-ui/src/button/buttonWidget.jsx`

Remove the outer `div` container (which holds flex layout and padding) and let the `Button` itself be the root element. Style the `Button` with `!h-full !w-full rounded-none border-0` so it stretches seamlessly to the outer card boundaries:
```javascript
return (
  <Button
    variant={variant}
    size={size}
    onClick={handleClick}
    disabled={loading || isLoadingWorkflows}
    className="!h-full !w-full rounded-none flex items-center justify-center text-center px-4 border-0"
  >
    {(loading || isLoadingWorkflows) && <Spinner className="mr-2 h-4 w-4" />}
    {text}
  </Button>
);
```

---

## Review and Self-Verification Plan
1. Ensure the project builds successfully after making the packages/widgets-ui changes.
2. Verify visual styling on dashboard slot components.
