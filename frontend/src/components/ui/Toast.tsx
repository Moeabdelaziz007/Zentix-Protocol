import { X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export function ToastComponent({ toast, onRemove }: ToastProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-4 shadow-lg ${
        toast.type === 'success' ? 'bg-success text-white' : 'bg-error text-white'
      }`}
    >
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface ToasterProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function Toaster({ toasts, onRemove }: ToasterProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}