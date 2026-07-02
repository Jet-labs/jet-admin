import React, { useEffect } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
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
import { Sparkles } from "lucide-react";
import { AIChatPanel } from "../aiComponents/AIChatPanel";
import { useAIStore } from "../../../logic/stores/useAIStore";

export const ProtectedLayout = () => {
  const { firebaseUserState } = useAuthState();
  const { tenantID } = useParams();
  const { getUserConfig } = useAuthActions();
  const { isOpen, togglePanel } = useAIStore();

  const navigate = useNavigate();

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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePanel]);

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={!firebaseUserState || firebaseUserState.isLoading}
      error={firebaseUserState.error}
      loadingContainerClass="h-screen w-screen bg-background flex flex-col justify-center items-center"
    >
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <nav className="w-full  border-b-2 border-primary bg-background">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start rtl:justify-end">
                <Link to="/">
                  <div className="flex flex-row items-end">
                    <img src={logo} className="w-8 h-8" />
                  </div>
                </Link>
              </div>
              <Breadcrumbs />

              <div className="flex flex-row justify-end items-center gap-2">
                {/* AI Agent toggle button */}
                {tenantID && (
                  <button
                    id="ai-panel-toggle"
                    onClick={togglePanel}
                    title="AI Agent (Ctrl+K)"
                    className={`
                      flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[12px] font-medium
                      transition-all duration-150
                      ${isOpen
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                      }
                    `}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI</span>
                  </button>
                )}

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
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <MainDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <div className="w-full h-full overflow-hidden bg-background">
              <Outlet />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* AI Chat Panel — fixed position, doesn't affect layout */}
      <AIChatPanel />
    </ReactQueryLoadingErrorWrapper>
  );
};
