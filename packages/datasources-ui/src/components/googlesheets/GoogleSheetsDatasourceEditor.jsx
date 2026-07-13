import React, { useState, useCallback } from "react";
import { useDatasourceEditorContext } from "../../context/DatasourceEditorContext";
import {
  Input,
  Label,
  Button,
  Textarea,
  Callout,
} from "@jet-admin/ui";
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
    <div className="flex items-center gap-2">
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
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
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
      className={`flex items-start gap-3 p-3.5 rounded border text-left transition-all w-full ${
        isSelected
          ? "border-primary bg-primary/10 text-foreground shadow-sm"
          : "border-border bg-background text-muted-foreground hover:bg-muted/30"
      }`}
    >
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${isSelected ? "text-primary" : "text-muted-foreground/80"}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {isSelected && (
        <Check className="h-4 w-4 text-primary shrink-0 ml-auto mt-0.5" />
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
    <div className="space-y-2">
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* ── Step 0: Authentication ── */}
      {currentStep === 0 && (
        <div className="space-y-2">
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
              <Label>
                Service Account JSON Key
              </Label>
              <Textarea
                className="min-h-[160px] font-mono text-xs"
                placeholder='Paste the entire JSON key content here...'
                value={options.serviceAccountKey || ""}
                onChange={handleServiceAccountKeyChange}
              />
              {hasServiceAccountKey && (
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Key provided</span>
                </div>
              )}
              <Button
                type="button"
                disabled={!hasServiceAccountKey}
                onClick={handleServiceAccountContinue}
                variant="green"
                className="w-full"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* OAuth Connect Button */}
          {authType === "oauth2" && (
            <div className="space-y-3 pt-2">
              {isOAuthConnected ? (
                <div className="flex items-center gap-3 p-3 rounded border border-primary/20 bg-primary/5">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Google Account Connected</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                      Credential ID: {options.oauth2.vaultCredentialID}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleOAuthConnect}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground h-7 text-xs font-normal"
                  >
                    Reconnect
                  </Button>
                </div>
              ) : (
                <Callout>
                  You'll be redirected to Google to authorize access to your spreadsheets.
                  Credentials are stored securely in the vault.
                </Callout>
              )}

              {isOAuthConnected ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  variant="green"
                  className="w-full"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleOAuthConnect}
                  disabled={oauth.loading}
                  variant="green"
                  className="w-full"
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
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Step 1: Configuration ── */}
      {currentStep === 1 && (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={() => setCurrentStep(0)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-7 px-2 -ml-2 font-normal"
          >
            ← Back to authentication
          </Button>

          {/* Connection status */}
          <div className="flex items-center gap-2 p-2.5 rounded border border-primary/20 bg-primary/5 text-xs text-primary">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="font-semibold">
              {authType === "oauth2" ? "OAuth 2.0" : "Service Account"} — Connected
            </span>
          </div>

          <div className="space-y-1">
            <Label htmlFor="gs-connectionName">
              Connection Name
            </Label>
            <Input
              id="gs-connectionName"
              type="text"
              placeholder="My Google Sheets"
              value={options.connectionName || ""}
              onChange={handleConnectionNameChange}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="gs-defaultSpreadsheetId">
              Default Spreadsheet ID <span className="text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                id="gs-defaultSpreadsheetId"
                type="text"
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
