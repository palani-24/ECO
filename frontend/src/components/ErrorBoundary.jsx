import React from 'react';
import { FaExclamationTriangle, FaRedo, FaTrash } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Application Error Caught:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-3xl border border-rose-500/30 animate-pulse">
            <FaExclamationTriangle />
          </div>

          <div className="space-y-1 max-w-md">
            <h2 className="text-2xl font-black text-white">EcoReward App Encountered an Error</h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              An unhandled UI error occurred. You can reload the application or reset your session below.
            </p>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full text-left">
            <span className="text-[10px] font-mono text-rose-400 block font-bold truncate">
              {this.state.error?.toString() || 'Unknown React Render Exception'}
            </span>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow flex items-center space-x-2 transition-all"
            >
              <FaRedo />
              <span>Reload App</span>
            </button>

            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center space-x-2 transition-all"
            >
              <FaTrash />
              <span>Reset Session</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
