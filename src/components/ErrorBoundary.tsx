import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected application error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Application ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      let readableMessage = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message) as {
          error?: string;
          operationType?: string;
          path?: string;
        };
        if (parsed.error && parsed.operationType) {
          readableMessage = `Database access error during ${parsed.operationType}${
            parsed.path ? ` on ${parsed.path}` : ''
          }: ${parsed.error}`;
        }
      } catch {
        // Use raw message if not JSON
      }

      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-xl border border-stone-800 bg-stone-900/70 p-7 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-stone-100">
              Unable to complete request
            </h1>
            <p className="mt-2 text-sm text-stone-400 leading-relaxed break-words">
              {readableMessage}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-6 inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Return to Sanctuary</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
