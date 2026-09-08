import React, { useState } from 'react';
import { EvaluatedQuote } from '../types';
import { X, Copy, Check, ExternalLink, Flame, AlertTriangle } from 'lucide-react';

interface PRDetailModalProps {
  prNo: string | null;
  quotes: EvaluatedQuote[];
  onClose: () => void;
  onToggleStatus: (quoteId: string) => void;
}

export const PRDetailModal: React.FC<PRDetailModalProps> = ({
  prNo,
  quotes,
  onClose,
  onToggleStatus,
}) => {
  const [copied, setCopied] = useState(false);

  if (!prNo) return null;

  const prQuotes = quotes.filter((q) => q.pr_no === prNo);
  if (prQuotes.length === 0) return null;

  const first = prQuotes[0];

  const handleCopyTable = () => {
    const headers = ['견적번호', '공급사', '단가(KRW)', '편차율', '수량', '약속납기', '납기판정', '상태'];
    const rows = prQuotes.map((q) => [
      q.quote_id,
      q.supplier,
      q.unit_price !== null ? q.unit_price.toLocaleString() : '미기재',
      q.priceDeviationPct !== null ? `${q.priceDeviationPct}%` : '-',
      `${q.qty} ${q.unit}`,
      q.promised_date || '-',
      q.deliveryState,
      q.status,
    ]);

    const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">{prNo} 공급사 견적 비교</h2>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {first.item_code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              품목명: <strong className="text-slate-700">{first.item_name}</strong> · 수량: {first.qty} {first.unit} · 필요일: {first.required_date}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTable}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '복사 완료!' : '비교표 복사'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Summary alerts inside modal */}
          {prQuotes.some((q) => q.isIssuedNotLowest) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>안내: 이 PR은 최저가 견적이 아닌 공급사로 발주 처리된 건이 포함되어 있습니다.</span>
            </div>
          )}

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">견적번호</th>
                  <th className="py-3 px-4">공급사</th>
                  <th className="py-3 px-4">단가 (KRW)</th>
                  <th className="py-3 px-4">중앙값 대비 편차</th>
                  <th className="py-3 px-4">약속납기</th>
                  <th className="py-3 px-4">납기 판정</th>
                  <th className="py-3 px-4">상태</th>
                  <th className="py-3 px-4 text-center">발주 전환</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {prQuotes.map((q) => (
                  <tr
                    key={q.quote_id}
                    className={`${q.isLowestPrice ? 'bg-blue-50/40' : ''} hover:bg-slate-50 transition-colors`}
                  >
                    <td className="py-3 px-4 font-medium text-slate-600 text-xs">
                      {q.quote_id}
                      <div className="text-[11px] text-slate-400">접수 {q.quote_date}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        {q.supplier}
                        {q.isLowestPrice && (
                          <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold shadow-xs">
                            최저가 후보
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {q.unit_price !== null ? `${q.unit_price.toLocaleString()}원` : <span className="text-slate-400 font-normal">단가 미기재</span>}
                    </td>
                    <td className="py-3 px-4">
                      {q.priceDeviationPct !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold ${
                              q.priceState === '이상치' ? 'text-orange-600' : 'text-slate-700'
                            }`}
                          >
                            {q.priceDeviationPct > 0 ? `+${q.priceDeviationPct}%` : `${q.priceDeviationPct}%`}
                          </span>
                          {q.priceState === '이상치' && (
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold flex items-center gap-0.5">
                              <Flame className="w-3 h-3" /> 이상치
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {q.promised_date || <span className="text-slate-400">미기재</span>}
                    </td>
                    <td className="py-3 px-4">
                      {q.status === '견적' ? (
                        <span className="text-slate-400 text-xs">견적 대기</span>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            q.deliveryState === '지연'
                              ? 'bg-rose-100 text-rose-700'
                              : q.deliveryState === '임박'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {q.deliveryState} ({q.dDayStr})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          q.status === '발주' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleStatus(q.quote_id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          q.status === '발주'
                            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        }`}
                      >
                        {q.status === '발주' ? '견적으로 변경' : '발주로 확정'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
