import { X, HelpCircle } from 'lucide-react';

export interface GuideStep {
  title: string;
  description: string;
}

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  steps: GuideStep[];
}

export default function GuideModal({ open, onClose, title, subtitle, steps }: GuideModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/80 text-gray-500 transition-colors"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-black shrink-0">
                {index + 1}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{step.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
