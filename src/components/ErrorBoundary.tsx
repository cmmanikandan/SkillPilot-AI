import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
          <div className="glass p-12 rounded-[2.5rem] max-w-md space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-slate-400">
              We encountered an unexpected error. Don't worry, your progress is safe.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-brand-purple rounded-2xl font-bold flex items-center justify-center gap-2 neon-glow"
            >
              <RefreshCw size={20} /> Reload Application
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="text-left text-xs bg-black/20 p-4 rounded-xl overflow-auto max-h-40 text-red-400">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
