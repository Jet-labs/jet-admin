import React, { Component, useEffect, useRef, useState } from "react";

import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";

import "./style.css";
const modes = ["tree", "form", "view", "code", "text"];
export const JSONEditorReact = ({ json, onChange, label, mode }) => {
  const containerRef = useRef();
  const _mode = mode ? mode : "code";

  const editorRef = useRef();

  const handleChange = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.get());
      // editorRef.current?.expandAll();
    }
  };

  useEffect(() => {
    if (containerRef.current != null) {
      if (editorRef.current != null) {
        editorRef.current.set(json);
        // editorRef.current.expandAll();
        if (_mode) {
          editorRef.current.setMode(_mode);
        }
      } else {
        editorRef.current = new JSONEditor(containerRef.current, {
          mode: _mode,
          indentation: 4,
          onChange: handleChange,
          mainMenuBar: true,
          enableSort: true,
          // theme: "/ace/theme/github",

          // onChangeJSON: _mode === "tree" ? onChange : null,
        });
        editorRef.current?.set(json);
        // editorRef.current?.expandAll();
      }
    }
  }, [containerRef, json, _mode]);

  useEffect(
    () => () => {
      editorRef.current?.destroy();
    },
    []
  );

  return (
    <div
      className="jsoneditor-react-container !h-1/2"
      style={{ height: 500 }}
      ref={containerRef}
    />
  );
};
