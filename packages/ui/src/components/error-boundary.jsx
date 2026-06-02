import React from "react";
import { AlertTriangle } from "lucide-react";
import PropTypes from "prop-types";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <div className="bg-muted/30 p-3 text-[10px] text-muted-foreground space-y-2 text-center">
            <div className="flex justify-center">
              <AlertTriangle className="h-4 w-4 text-foreground/80" />
            </div>
            <div className="font-medium text-xs text-foreground">
              {this.props.title || "Component Error"}
            </div>
            <div className="max-w-xs break-words">
              {this.state.error?.message || "Something went wrong while rendering this component."}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  title: PropTypes.string,
};
