import { AiUsageSummary } from '../types';
import { formatTokenCount, formatUsd } from '../services/aiUsageService';

interface AiUsageCardProps {
  usage: AiUsageSummary;
  compact?: boolean;
}

export default function AiUsageCard({ usage, compact = false }: AiUsageCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      <h3 className={`font-bold text-gray-900 ${compact ? 'text-sm mb-3' : 'text-lg mb-4'}`}>
        AI Usage & Cost
      </h3>

      <div className={`grid ${compact ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-3 gap-4'}`}>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Input Tokens</p>
          <p className="text-lg font-black text-slate-900 mt-1">{formatTokenCount(usage.tokens.input)}</p>
          <p className="text-xs text-slate-500 mt-1">{formatUsd(usage.costs.input)}</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Output Tokens</p>
          <p className="text-lg font-black text-slate-900 mt-1">{formatTokenCount(usage.tokens.output)}</p>
          <p className="text-xs text-slate-500 mt-1">{formatUsd(usage.costs.output)}</p>
        </div>

        <div className={`p-3 bg-blue-50 rounded-xl border border-blue-100 ${compact ? 'col-span-2' : 'md:col-span-1'}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Total Cost</p>
          <p className="text-lg font-black text-blue-700 mt-1">{formatUsd(usage.costs.total)}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
        <span>Input rate: {formatUsd(usage.rates.inputPerMTok)}/MTok</span>
        <span>Output rate: {formatUsd(usage.rates.outputPerMTok)}/MTok</span>
      </div>
    </div>
  );
}
