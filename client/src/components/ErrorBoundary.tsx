import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-gray-50">
          <div className="flex flex-col items-center w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl text-center">
            <AlertTriangle
              size={48}
              className="text-blue-700 mb-6 flex-shrink-0"
            />

            <h2 className="font-display text-2xl mb-2 text-gray-900">Ups, algo salió mal</h2>
            <p className="font-body text-gray-600 mb-6">
              Estamos trabajando para que tu experiencia sea perfecta. Por favor, intenta refrescar la página.
            </p>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg",
                "bg-blue-700 text-white",
                "hover:bg-blue-800 transition-all cursor-pointer font-body font-medium"
              )}
            >
              <RotateCcw size={16} />
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;