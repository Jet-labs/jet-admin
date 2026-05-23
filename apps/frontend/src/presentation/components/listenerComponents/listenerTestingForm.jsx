import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, Square, Unplug } from 'lucide-react';
import React, { useState, useEffect, useRef } from "react";
import { CONSTANTS } from "../../../constants";
import {
  activateListenerAPI,
  deactivateListenerAPI,
} from "../../../data/apis/listener";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import { Button, Spinner } from "@jet-admin/ui";
import { useSocketStore } from "../../../logic/stores/useSocketStore";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const ListenerTestingForm = ({
  tenantID,
  listenerID,
  currentStatus,
  onStatusChange,
}) => {
  ListenerTestingForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    listenerID: PropTypes.string.isRequired,
    currentStatus: PropTypes.string,
    onStatusChange: PropTypes.func,
  };

  const queryClient = useQueryClient();
  const [testResult, setTestResult] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const socket = useSocketStore((state) => state.socket);
  const scrollRef = useRef(null);
  const scrollRefTransformed = useRef(null);
  const isActive = currentStatus === "active";

  // Join/leave the listener's test room for targeted event streaming
  useEffect(() => {
    if (!socket || !listenerID) return;

    const testRoom = `listener_test:${listenerID}`;
    socket.emit('join_room', testRoom);

    return () => {
      socket.emit('leave_room', testRoom);
    };
  }, [socket, listenerID]);

  useEffect(() => {
    if (!socket || !isActive) return;

    const handleTestEvent = (data) => {
      if (data.listenerID === listenerID) {
        setLiveEvents((prev) => [...prev, data].slice(-20)); // Keep last 20 events to limit memory
      }
    };

    socket.on("listener_test_event", handleTestEvent);
    return () => socket.off("listener_test_event", handleTestEvent);
  }, [socket, listenerID, isActive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (scrollRefTransformed.current) {
      scrollRefTransformed.current.scrollTop = scrollRefTransformed.current.scrollHeight;
    }
  }, [liveEvents]);

  const { isPending: isActivating, mutate: activateListener } = useMutation({
    mutationFn: () => activateListenerAPI({ tenantID, listenerID }),
    retry: false,
    onSuccess: (data) => {
      setTestResult({ success: true, message: "Listener activated", data });
      displaySuccess("Listener activated successfully");
      setLiveEvents([]); // Clear past events
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID),
      ]);
      queryClient.invalidateQueries([
        "LISTENER_DETAIL",
        tenantID,
        listenerID,
      ]);
      onStatusChange?.("active");
    },
    onError: (error) => {
      setTestResult({
        success: false,
        message: error?.message || "Activation failed",
      });
      displayError(error);
    },
  });

  const { isPending: isDeactivating, mutate: deactivateListener } =
    useMutation({
      mutationFn: () => deactivateListenerAPI({ tenantID, listenerID }),
      retry: false,
      onSuccess: (data) => {
        setTestResult({
          success: true,
          message: "Listener deactivated",
          data,
        });
        displaySuccess("Listener deactivated");
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID),
        ]);
        queryClient.invalidateQueries([
          "LISTENER_DETAIL",
          tenantID,
          listenerID,
        ]);
        onStatusChange?.("inactive");
      },
      onError: (error) => {
        setTestResult({
          success: false,
          message: error?.message || "Deactivation failed",
        });
        displayError(error);
      },
    });

  const isBusy = isActivating || isDeactivating;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-foreground">
            Live Event Stream
          </span>
          <div className="flex items-center gap-1.5 ml-2 border-l border-border pl-3">
            {isActive ? (
              <Unplug className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
                <Unplug className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                isActive ? "text-emerald-500" : "text-zinc-500"
              }`}
            >
              {currentStatus || "inactive"}
            </span>
          </div>
          {testResult && (
            <div className={`ml-2 flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-sm border ${
              testResult.success
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                : "border-red-500/30 bg-red-500/5 text-red-400"
            }`}>
               <span className="font-semibold">{testResult.success ? "✓" : "✗"}</span>
               {testResult.message}
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
          {liveEvents.length > 0 && (
            <Button
              onClick={() => setLiveEvents([])}
              variant="secondary"
              size="sm"
              className="h-7 text-[11px]"
            >
              Clear
            </Button>
          )}
          <div className="w-px h-4 bg-border mx-1"></div>
          {isActive ? (
            <Button
              onClick={() => deactivateListener()}
              disabled={isBusy}
              type="button"
              variant="destructive"
              size="sm"
            >
              {isDeactivating ? <Spinner size={12} /> : <Square className="w-2.5 h-2.5" />}
              <span className="ml-1.5">Deactivate</span>
            </Button>
          ) : (
            <Button
              onClick={() => activateListener()}
              disabled={isBusy}
                type="button"
              size="sm"

            >
                {isActivating ? <Spinner size={12} /> : <Play className="w-2.5 h-2.5" />}
              <span className="ml-1.5">Activate</span>
            </Button>
          )}
        </div>
      </div>

      {/* Live Events Terminal Split */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Raw Event Stream */}
        <ResizablePanel defaultSize={50} className="flex flex-col bg-zinc-950">
          <div className="px-3 py-1.5 border-b border-zinc-800 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider flex-shrink-0">
             Raw Event Stream
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed text-zinc-300" ref={scrollRef}>
            {!isActive && liveEvents.length === 0 && (
              <div className="text-zinc-600 italic">Listener is not active. Activate to stream events.</div>
            )}
            {isActive && liveEvents.length === 0 && (
              <div className="text-zinc-500 italic">Waiting for events...</div>
            )}
            {liveEvents.map((evt, idx) => (
              <div key={idx} className="mb-2 border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                <div className="text-zinc-500 mb-1">[{new Date(evt.timestamp).toLocaleTimeString()}]</div>
                <pre className="whitespace-pre-wrap break-words text-emerald-400">
                  {typeof evt.rawEvent === "object"
                    ? JSON.stringify(evt.rawEvent, null, 2)
                    : evt.rawEvent}
                </pre>
              </div>
            ))}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle={true} />

        {/* Transformed Event Stream */}
        <ResizablePanel defaultSize={50} className="flex flex-col bg-zinc-950">
          <div className="px-3 py-1.5 border-b border-zinc-800 text-[10px] uppercase font-semibold text-indigo-400/70 tracking-wider flex-shrink-0">
             Transformed Stream
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed text-zinc-300" ref={scrollRefTransformed}>
            {!isActive && liveEvents.length === 0 && (
              <div className="text-zinc-600 italic">Listener is not active.</div>
            )}
            {isActive && liveEvents.length === 0 && (
              <div className="text-zinc-500 italic">Waiting for events...</div>
            )}
            {liveEvents.map((evt, idx) => (
              <div key={`transform-${idx}`} className="mb-2 border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                <div className="text-zinc-500 mb-1">[{new Date(evt.timestamp).toLocaleTimeString()}]</div>
                {evt.transformError ? (
                  <pre className="whitespace-pre-wrap break-words text-red-400">
                    Error: {evt.transformError}
                  </pre>
                ) : evt.transformedEvent === null || evt.transformedEvent === undefined ? (
                  <div className="text-zinc-500 italic">Dropped (returned null/undefined)</div>
                ) : (
                  <pre className="whitespace-pre-wrap break-words text-indigo-400">
                    {typeof evt.transformedEvent === "object"
                      ? JSON.stringify(evt.transformedEvent, null, 2)
                      : String(evt.transformedEvent)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
