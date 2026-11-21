import React, { useEffect, useState, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import logo from "../../../assets/logo.png";

import { CONSTANTS } from "../../../constants";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/hooks/useAuth";
import { MainDrawerList } from "../drawerList/mainDrawerList";
import { Breadcrumbs } from "../ui/breadCrumbs";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { UserAvatar } from "../ui/userAvatar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { Menu, Sparkles, X } from "lucide-react";
import { AIChatPanel } from "../aiComponents/AIChatPanel";
import { useAIStore } from "../../../logic/stores/useAIStore";
import { Input } from "@jet-admin/ui";

export const ProtectedLayout = () => {
  const { firebaseUserState } = useAuthState();
  const { tenantID } = useParams();
  const { getUserConfig } = useAuthActions();
  const { togglePanel, openPanel, openWithMessage } = useAIStore();
  const [agentQuery, setAgentQuery] = useState("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const agentInputRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (tenantID && firebaseUserState && firebaseUserState.user) {
      getUserConfig({ tenantID });
    }
  }, [tenantID, getUserConfig, firebaseUserState]);

  useEffect(() => {
    if (
      firebaseUserState &&
      !firebaseUserState.isLoading &&
      !firebaseUserState.user
    ) {
      navigate(CONSTANTS.ROUTES.SIGN_IN.path());
    }
  }, [firebaseUserState]);

  // Keyboard shortcut: Ctrl+K or Cmd+K toggles the AI panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        togglePanel();
      }
      if (e.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePanel]);

  // Mobile navigation is an overlay; dismiss it on every route change.
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={!firebaseUserState || firebaseUserState.isLoading}
      error={firebaseUserState.error}
      loadingContainerClass="h-screen w-screen bg-background flex flex-col justify-center items-center"
    >
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <nav className="w-full border-b border-border bg-background">
          <div className="px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center justify-start gap-2 rtl:justify-end sm:gap-4">
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(true)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
                  aria-label="Open navigation"
                  aria-expanded={isMobileNavOpen}
                >
                  <Menu className="h-4 w-4" />
                </button>
                <Link to="/" className="shrink-0">
                  <div className="flex flex-row items-end">
                    <img src={logo} className="h-8 w-8" alt="Jet Admin" />
                  </div>
                </Link>
              </div>


              <div className="flex min-w-0 flex-1 flex-row items-center justify-end gap-2 sm:gap-3">
                <Breadcrumbs />
                {/* AI Agent input */}
                {tenantID && (
                  <Input
                    ref={agentInputRef}
                    type="text"
                    size="sm"
                    value={agentQuery}
                    className="hidden max-w-32 sm:block"
                    onChange={(e) => setAgentQuery(e.target.value)}
                    onFocus={() => openPanel()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && agentQuery.trim()) {
                        e.preventDefault();
                        openWithMessage(agentQuery.trim());
                        setAgentQuery("");
                      }
                      if (e.key === "Escape") {
                        agentInputRef.current?.blur();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Ask Agent…"
                  />
                )}

                <button
                  type="button"
                  onClick={() => openPanel()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
                  aria-label="Open AI assistant"
                >
                  <Sparkles className="h-4 w-4" />
                </button>

                <UserAvatar />
              </div>
            </div>
          </div>
        </nav>
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.MAIN_DRAWER_LIST_SEPARATION
          }
          className="flex-1 overflow-hidden w-full"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            className="max-md:hidden"
          >
            <MainDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} className="max-md:hidden" />
          <ResizablePanel defaultSize={80}>
            <div className="w-full h-full overflow-hidden bg-background">
              <Outlet />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile navigation overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-background shadow-lg">
            <div className="flex items-center justify-between border-b border-border p-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Navigation
              </span>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <MainDrawerList />
            </div>
          </aside>
        </div>
      )}

      {/* AI Chat Panel — fixed position, doesn't affect layout */}
      <AIChatPanel />
    </ReactQueryLoadingErrorWrapper>
  );
};
