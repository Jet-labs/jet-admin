import React from "react";
import PropTypes from "prop-types";
import { ChevronLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./button";
import { Spinner } from "./spinner";

export const PageHeader = ({
  title,
  id,
  onSave,
  onDelete,
  onClone,
  onHistory,
  isSaving = false,
  isDeleting = false,
  isCloning = false,
  hasHistory = false,
  saveText = "Update",
  parentTitle,
  children,
}) => {

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-background p-3 px-4">

      <div className="flex items-center gap-4">
        {parentTitle && (
          <>
            <h1
              className="text-base font-semibold tracking-tight text-foreground leading-none"
            >
              
              {parentTitle}
            </h1>
            <span className="text-base font-semibold tracking-tight text-foreground leading-none"
>/</span>
          </>
        )}
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground leading-none">
            {title}
          </h1>
          {id && (
            <p className="mt-1.5 font-mono text-xs text-muted-foreground">
              ID: {id}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {children}

        {hasHistory && onHistory && (
          <Button variant="outline" size="sm" onClick={onHistory}>
            View History
          </Button>
        )}

        {onClone && (
          <Button variant="outline" size="sm" onClick={onClone} disabled={isCloning}>
            {isCloning && <Spinner size={14} className="mr-2" />}
            Clone
          </Button>
        )}

        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-destructive hover:bg-destructive/10 border-destructive/20"
          >
            {isDeleting && <Spinner size={14} className="mr-2" />}
            Delete
          </Button>
        )}

        {onSave && (
          <Button size="sm" onClick={onSave} disabled={isSaving}>
            {isSaving && <Spinner size={14} className="mr-2" />}
            {saveText}
          </Button>
        )}
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  id: PropTypes.string,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
  onClone: PropTypes.func,
  onHistory: PropTypes.func,
  isSaving: PropTypes.bool,
  isDeleting: PropTypes.bool,
  isCloning: PropTypes.bool,
  hasHistory: PropTypes.bool,
  saveText: PropTypes.string,
  children: PropTypes.node,
};