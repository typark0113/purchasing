import React from 'react';
import { EvaluatedQuote } from '../types';
import { ExternalLink, Flame, AlertTriangle, Clock, CheckCircle2, Edit2, Trash2 } from 'lucide-react';

interface QuoteTableProps {
  quotes: EvaluatedQuote[];
  viewMode: 'table' | 'grouped';
  onSelectPR: (prNo: string) => void;
  onToggleStatus: (quoteId: string) => void;
  onEditQuote: (quote: EvaluatedQuote) => void;
  onDeleteQuote: (quoteId: string) => void;
}

export const QuoteTable: React.FC<QuoteTableProps> = ({
  quotes,
  viewMode,
  onSelectPR,
  onToggleStatus,
  onEditQuote,
  onDeleteQuote,
}) => {
  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ExternalLink className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-1">조건에 일치하는 견적 데이터가 없습니다</h3>
        <p className="text-sm text-slate-400">검색어 또는 필터 조건을 변경하거나 새로운 견적을 추가해보세요.</p>
      </div>
    );
  }

  // If grouped by PR
  if (viewMode === 'grouped') {
    const grouped: { [prNo: string]: EvaluatedQuote[] } = {};
    quotes.forEach((q) => {
      if (!grouped[q.pr_no]) grouped[q.pr_no] = [];
      grouped[q.pr_no].push(q);
    });

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([prNo, prQuotes]) => {
          const itemCode = prQuotes[0]?.item_code;
          const itemName = prQuotes[0]?.item_name;
          const requiredDate = prQuotes[0]?.required_date;
          const hasIssued = prQuotes.some((q) => q.status === '발주');
          const issuedNotLowest = prQuotes.some((q) => q.isIssuedNotLowest);

          return (
            <div key={prNo} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* PR Header */}
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSelectPR(prNo)}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1.5 text-base"
                  >
                    {prNo}
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-medium">
                    {itemCode}
                  </span>
                  <span className="font-medium text-slate-800 text-sm">{itemName}</span>
                  {prQuotes[0]?.isNameMismatch && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 rounded text-[11px] font-semibold">
                      표기 상이
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div>필요일: <span className="font-medium text-slate-700">{requiredDate}</span></div>
                  <div>견적건수: <span className="font-medium text-slate-700">{prQuotes.length}건</span></div>
                  <button
                    onClick={() => onSelectPR(prNo)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm text-xs"
                  >
                    PR 비교 상세
                  </button>
                </div>
              </div>

              {/* Quotes inside PR */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 bg-slate-50/50">
                      <th className="py-2.5 px-4">견적번호 / 공급사</th>
                      <th className="py-2.5 px-4">단가 (KRW)</th>
                      <th className="py-2.5 px-4">단가 편차</th>
                      <th className="py-2.5 px-4">수량 / 단위</th>
                      <th className="py-2.5 px-4">약속납기</th>
                      <th className="py-2.5 px-4">납기판정</th>
                      <th className="py-2.5 px-4">상태</th>
                      <th className="py-2.5 px-4 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {prQuotes.map((q) => (
                      <tr key={q.quote_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 flex items-center gap-2">
                            {q.supplier}
                            {q.isLowestPrice && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
                                최저가
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{q.quote_id} · 접수 {q.quote_date}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {q.unit_price !== null ? `${q.unit_price.toLocaleString()}원` : <span className="text-slate-400 font-normal">미기재</span>}
                        </td>
                        <td className="py-3 px-4">
                          {q.priceDeviationPct !== null ? (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-medium ${
                                  q.priceState === '이상치'
                                    ? 'text-orange-600 font-bold'
                                    : 'text-slate-600'
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
                          {q.qty.toLocaleString()} {q.unit}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {q.promised_date || <span className="text-slate-400">미기재</span>}
                        </td>
                        <td className="py-3 px-4">
                          {q.status === '견적' ? (
                            <span className="text-slate-400 text-xs">견적 대기</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  q.deliveryState === '지연'
                                    ? 'bg-rose-100 text-rose-700'
                                    : q.deliveryState === '임박'
                                    ? 'bg-amber-100 text-amber-700'
                                    : q.deliveryState === '정상'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {q.deliveryState} ({q.dDayStr})
                              </span>
                              {q.isOverRequiredDate && (
                                <span title="필요일 초과 납기" className="w-2 h-2 rounded-full bg-orange-500"></span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => onToggleStatus(q.quote_id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              q.status === '발주'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {q.status}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditQuote(q)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="수정"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteQuote(q.quote_id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Flat table view
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50">
              <th className="py-3 px-4">PR번호</th>
              <th className="py-3 px-4">품목코드 / 명칭</th>
              <th className="py-3 px-4">공급사</th>
              <th className="py-3 px-4">수량</th>
              <th className="py-3 px-4">단가 (KRW)</th>
              <th className="py-3 px-4">단가 판정</th>
              <th className="py-3 px-4">약속납기</th>
              <th className="py-3 px-4">납기 판정</th>
              <th className="py-3 px-4">상태</th>
              <th className="py-3 px-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {quotes.map((q) => (
              <tr key={q.quote_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => onSelectPR(q.pr_no)}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {q.pr_no}
                  </button>
                  <span className="text-xs text-slate-400">{q.quote_id}</span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-800 flex items-center gap-2">
                    {q.item_name}
                    {q.isNameMismatch && (
                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 rounded text-[10px] font-semibold" title="동일 item_code 내 명칭 상이">
                        표기상이
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{q.item_code}</div>
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-700">
                  <div className="flex items-center gap-1.5">
                    {q.supplier}
                    {q.isLowestPrice && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
                        최저가
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  {q.qty.toLocaleString()} {q.unit}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  {q.unit_price !== null ? `${q.unit_price.toLocaleString()}원` : <span className="text-slate-400 font-normal">미기재</span>}
                </td>
                <td className="py-3.5 px-4">
                  {q.priceDeviationPct !== null ? (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-medium ${
                          q.priceState === '이상치' ? 'text-orange-600 font-bold' : 'text-slate-600'
                        }`}
                      >
                        {q.priceDeviationPct > 0 ? `+${q.priceDeviationPct}%` : `${q.priceDeviationPct}%`}
                      </span>
                      {q.priceState === '이상치' && (
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">
                          이상치
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs">-</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-slate-700 text-xs">
                  <div>{q.promised_date || <span className="text-slate-400">미기재</span>}</div>
                  <div className="text-[11px] text-slate-400">필요: {q.required_date}</div>
                </td>
                <td className="py-3.5 px-4">
                  {q.status === '견적' ? (
                    <span className="text-slate-400 text-xs">견적 대기</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          q.deliveryState === '지연'
                            ? 'bg-rose-100 text-rose-700'
                            : q.deliveryState === '임박'
                            ? 'bg-amber-100 text-amber-700'
                            : q.deliveryState === '정상'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {q.deliveryState} ({q.dDayStr})
                      </span>
                      {q.isOverRequiredDate && (
                        <span title="필요일 초과 납기" className="w-2 h-2 rounded-full bg-orange-500"></span>
                      )}
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => onToggleStatus(q.quote_id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      q.status === '발주'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {q.status}
                  </button>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEditQuote(q)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="수정"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteQuote(q.quote_id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
