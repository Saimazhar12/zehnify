import { Shield, X } from 'lucide-react';
import { TERMS_LAST_UPDATED, TERMS_SECTIONS } from '../content/termsAndConditions';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export default function TermsModal({ open, onClose, onAccept }: TermsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4 bg-indigo-600 text-white relative overflow-hidden shrink-0">
          <Shield className="absolute right-4 top-4 w-20 h-20 text-indigo-500 opacity-40" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold">Terms & Conditions</h2>
            <p className="text-indigo-100 text-sm mt-1">Last updated: {TERMS_LAST_UPDATED}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors relative z-10"
            aria-label="Close terms"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {TERMS_SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="font-bold text-gray-900 text-sm mb-1.5">{section.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {onAccept && (
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
            >
              I Agree
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
