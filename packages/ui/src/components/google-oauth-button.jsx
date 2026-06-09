import React from "react";
import PropTypes from "prop-types";
import { Button } from "./button";
import { Label } from "./label";
import { CheckCircle2, AlertCircle } from "lucide-react";

const GoogleIcon = () => (
  <svg
    className="mr-2 h-4 w-4"
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="google"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 488 512"
  >
    <path
      fill="currentColor"
      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
    />
  </svg>
);

export const GoogleOAuthButton = ({
  isConnected,
  credentialId,
  onClick,
  loading,
  disabled,
  label,
  description,
  hasErrors,
  errors
}) => {
  return (
    <div className="space-y-1.5 w-full">
      <Label
        className={`block text-xs font-medium ${
          hasErrors ? "text-red-500" : "text-muted-foreground"
        }`}
      >
        {label || description || "Google Authentication"}
      </Label>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-border rounded-md bg-card text-card-foreground shadow-sm">
        {isConnected ? (
          <>
            <div className="flex items-center gap-2 flex-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Google Account Connected
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate max-w-xs sm:max-w-md">
                  Credential ID: {credentialId}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || loading}
              onClick={onClick}
            >
              {loading ? "Connecting..." : "Reconnect Account"}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-1">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Account authentication required
                </p>
                <p className="text-xs text-muted-foreground">
                  Connect your Google Account to enable database query execution.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={disabled || loading}
              onClick={onClick}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              <GoogleIcon />
              {loading ? "Connecting..." : "Connect Google Account"}
            </Button>
          </>
        )}
      </div>

      {hasErrors && errors && (
        <p className="text-xs text-red-500 mt-1">{errors}</p>
      )}
    </div>
  );
};

GoogleOAuthButton.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  credentialId: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  description: PropTypes.string,
  hasErrors: PropTypes.bool,
  errors: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
};
