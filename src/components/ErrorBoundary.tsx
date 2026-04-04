"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error(
      JSON.stringify({
        level: "error",
        context: "ErrorBoundary",
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        ts: new Date().toISOString(),
      }),
    );
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen flex items-center justify-center p-6 text-center">
            <div>
              <p className="text-lg font-semibold mb-2">Something went wrong</p>
              <p className="text-sm text-muted mb-4">
                Refresh the page to try again.
              </p>
              <button
                onClick={() => this.setState({ error: null })}
                className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent-hover transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
