import React, { useState } from "react";
import PropTypes from "prop-types";
import { Copy, Check, AlertTriangle } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@jet-admin/ui";

export const APIKeyDisplayDialog = ({ open, onClose, apiKey }) => {
  APIKeyDisplayDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    apiKey: PropTypes.string,
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy API Key: ", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent
        hideCloseIcon={true}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            API Key Created
          </DialogTitle>
          <DialogDescription>
            Please make sure to copy your API key now. You will not be able to see it again.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {/* Warning banner */}
          <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-500">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-normal font-medium">
              For security reasons, this key will only be shown once. If you lose it, you will need to create a new one.
            </div>
          </div>

          {/* Key display container */}
          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded border border-border">
            <code className="text-xs font-mono select-all break-all flex-1 text-foreground">
              {apiKey}
            </code>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button onClick={onClose} type="button" className="w-full sm:w-auto">
            I've copied the key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
