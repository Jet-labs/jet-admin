/**
 * GoogleSheetsDatasourceEditor.jsx
 *
 * Dedicated datasource editor for Google Sheets.
 * Multi-step wizard: Auth method → OAuth/Service Account → Default spreadsheet (optional).
 *
 * Consumes DatasourceEditorContext for OAuth helpers.
 * Receives strict datasourceEditorForm: { datasourceOptions, setDatasourceOptions, patchDatasourceOptions }
 */

import React, { useState, useCallback } from "react";
import { useDatasourceEditorContext } from "../../context/DatasourceEditorContext";
import { InfoCallout } from "../../primitives/EditorPrimitives";
import {
  KeyRound,
  Globe,
  Check,
  Loader2,
  ShieldCheck,
  FileSpreadsheet,
  ChevronRight,
} from "lucide-react";

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isComplete = i < currentStep;
        return (
          <React.Fragment key={step.id}>
            {i > 0 && (
              <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${
                isComplete ? "text-primary" : "text-muted-foreground/30"
              }`} />
            )}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              isActive
                ? "bg-muted text-foreground"
                : isComplete
                  ? "bg-muted/50 text-foreground/70"
                  : "text-muted-foreground/50"
            }`}>
              {isComplete ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="h-4 w-4 flex items-center justify-center rounded-full border text-[10px] font-bold border-current">
                  {i + 1}
                </span>
              )}
              {step.label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Auth method selector ────────────────────────────────────────────────────

function AuthMethodCard({ icon: Icon, title, description, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 p-4 rounded-md border-2 text-left transition-all w-full ${
        isSelected
          ? "border-foreground bg-muted/20 shadow-sm"
          : "border-border hover:border-muted-foreground/30 hover:bg-muted/10"
      }`}
    >
      <div className={`p-2 rounded-md shrink-0 border ${
        isSelected ? "bg-background text-foreground border-border shadow-sm" : "bg-muted text-muted-foreground border-transparent"
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {isSelected && (
        <Check className="h-4 w-4 text-foreground shrink-0 ml-auto mt-1" />
      )}
    </button>
  );
}

// ─── Steps ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "auth", label: "Authentication" },
  { id: "config", label: "Configuration" },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export const GoogleSheetsDatasourceEditor = ({ datasourceEditorForm }) => {
  const { oauth } = useDatasourceEditorContext();
  const options = datasourceEditorForm.datasourceOptions || {};
  const [currentStep, setCurrentStep] = useState(
    options.authType && (options.serviceAccountKey || options.oauth2?.vaultCredentialID)
      ? 1 : 0
  );

  const authType = options.authType || "serviceAccount";
  const isOAuthConnected = !!(options.oauth2?.vaultCredentialID);
  const hasServiceAccountKey = !!(options.serviceAccountKey);

  // ─── Auth method change ─────────────────────────────────────────────

  const handleAuthTypeChange = useCallback((type) => {
    datasourceEditorForm.patchDatasourceOptions({ authType: type });
  }, [datasourceEditorForm]);

  // ─── OAuth connect ──────────────────────────────────────────────────

  const handleOAuthConnect = useCallback(() => {
    oauth.startOAuth(
      (vaultCredentialID) => {
        datasourceEditorForm.patchDatasourceOptions({
          oauth2: { vaultCredentialID },
        });
        setCurrentStep(1);
      }
    );
  }, [oauth, datasourceEditorForm]);

  // ─── Service account key ────────────────────────────────────────────

  const handleServiceAccountKeyChange = useCallback((e) => {
    datasourceEditorForm.patchDatasourceOptions({
      serviceAccountKey: e.target.value,
    });
  }, [datasourceEditorForm]);

  const handleServiceAccountContinue = useCallback(() => {
    if (hasServiceAccountKey) {
      setCurrentStep(1);
    }
  }, [hasServiceAccountKey]);

  // ─── Config fields ─────────────────────────────────────────────────

  const handleConnectionNameChange = useCallback((e) => {
    datasourceEditorForm.patchDatasourceOptions({
      connectionName: e.target.value,
    });
  }, [datasourceEditorForm]);

  const handleDefaultSpreadsheetIdChange = useCallback((e) => {
    datasourceEditorForm.patchDatasourceOptions({
      defaultSpreadsheetId: e.target.value,
    });
  }, [datasourceEditorForm]);

  return (
    <div className="space-y-4">
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* ── Step 0: Authentication ── */}
      {currentStep === 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <AuthMethodCard
              icon={KeyRound}
              title="Service Account"
              description="Use a Google Cloud service account JSON key for server-to-server authentication."
              isSelected={authType === "serviceAccount"}
              onClick={() => handleAuthTypeChange("serviceAccount")}
            />
            <AuthMethodCard
              icon={Globe}
              title="OAuth 2.0"
              description="Connect your Google Account interactively. Best for accessing personal spreadsheets."
              isSelected={authType === "oauth2"}
              onClick={() => handleAuthTypeChange("oauth2")}
            />
          </div>

          {/* Service Account Key Input */}
          {authType === "serviceAccount" && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-medium text-foreground">
                Service Account JSON Key
              </label>
              <textarea
                className="w-full min-h-[160px] rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                placeholder='Paste the entire JSON key content here...'
                value={options.serviceAccountKey || ""}
                onChange={handleServiceAccountKeyChange}
              />
              {hasServiceAccountKey && (
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Key provided</span>
                </div>
              )}
              <button
                type="button"
                disabled={!hasServiceAccountKey}
                onClick={handleServiceAccountContinue}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* OAuth Connect Button */}
          {authType === "oauth2" && (
            <div className="space-y-3 pt-2">
              {isOAuthConnected ? (
                <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/30">
                  <ShieldCheck className="h-5 w-5 text-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Google Account Connected</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Credential ID: {options.oauth2.vaultCredentialID}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOAuthConnect}
                    className="ml-auto text-xs text-foreground underline-offset-2 hover:underline shrink-0"
                  >
                    Reconnect
                  </button>
                </div>
              ) : (
                <InfoCallout>
                  You'll be redirected to Google to authorize access to your spreadsheets.
                  Credentials are stored securely in the vault.
                </InfoCallout>
              )}

              {isOAuthConnected ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOAuthConnect}
                  disabled={oauth.loading}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {oauth.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4" />
                      Connect Google Account
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Step 1: Configuration ── */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setCurrentStep(0)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to authentication
          </button>

          {/* Connection status */}
          <div className="flex items-center gap-2 p-2.5 rounded-md border border-border bg-muted/30 text-xs">
            <ShieldCheck className="h-4 w-4 text-foreground shrink-0" />
            <span className="text-foreground font-medium">
              {authType === "oauth2" ? "OAuth 2.0" : "Service Account"} — Connected
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground" htmlFor="gs-connectionName">
              Connection Name
            </label>
            <input
              id="gs-connectionName"
              type="text"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="My Google Sheets"
              value={options.connectionName || ""}
              onChange={handleConnectionNameChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground" htmlFor="gs-defaultSpreadsheetId">
              Default Spreadsheet ID <span className="text-muted-foreground">(optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                id="gs-defaultSpreadsheetId"
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                value={options.defaultSpreadsheetId || ""}
                onChange={handleDefaultSpreadsheetIdChange}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Found in the spreadsheet URL: docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
