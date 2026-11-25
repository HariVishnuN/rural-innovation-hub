import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught a runtime error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-8 max-w-lg w-full text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {this.props.title || 'Something went wrong'}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                We encountered an unexpected error while displaying this view. Your saved data is safe.
              </p>
              {this.state.error?.message && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 break-words text-left max-h-32 overflow-y-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-soft hover:shadow-teal-500/25 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-slate-500" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
