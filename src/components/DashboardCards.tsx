import React from 'react';
import { EvaluatedQuote, FilterState } from '../types';
import { AlertTriangle, Clock, Flame, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface DashboardCardsProps {
  quotes: EvaluatedQuote[];
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ quotes, filter, setFilter }) => {
  const delayedCount = quotes.filter((q) => q.status === '발주' && q.deliveryState === '지연').length;
  const urgentCount = quotes.filter((q) => q.status === '발주' && q.deliveryState === '임박').length;
  const outlierCount = quotes.filter((q) => q.priceState === '이상치').length;
  const mismatchCount = quotes.filter((q) => q.isNameMismatch).length;
  const missingCount = quotes.filter((q) => q.unit_price === null || (q.status === '발주' && !q.promised_date)).length;
  const issuedNotLowestCount = quotes.filter((q) => q.isIssuedNotLowest).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 납기 지연 */}
      <button
        onClick={() =>
          setFilter((prev) => ({
            ...prev,
            deliveryState: prev.deliveryState === '지연' ? '전체' : '지연',
            status: prev.deliveryState === '지연' ? '전체' : '발주',
          }))
        }
        className={`text-left p-4 rounded-xl border transition-all ${
          filter.deliveryState === '지연'
            ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/30 shadow-sm'
            : 'bg-white border-slate-200 hover:border-rose-200 hover:bg-rose-50/30'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">납기 지연 (발주)</span>
          <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-rose-600">{delayedCount}건</div>
        <div className="text-[11px] text-slate-400 mt-1">D-DAY 지남</div>
      </button>

      {/* 납기 임박 */}
      <button
        onClick={() =>
          setFilter((prev) => ({
            ...prev,
            deliveryState: prev.deliveryState === '임박' ? '전체' : '임박',
            status: prev.deliveryState === '임박' ? '전체' : '발주',
          }))
        }
        className={`text-left p-4 rounded-xl border transition-all ${
          filter.deliveryState === '임박'
            ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30 shadow-sm'
            : 'bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50/30'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">납기 임박 (0~7일)</span>
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-amber-600">{urgentCount}건</div>
        <div className="text-[11px] text-slate-400 mt-1">긴급 모니터링</div>
      </button>

      {/* 단가 이상치 */}
      <button
        onClick={() =>
          setFilter((prev) => ({
            ...prev,
            priceState: prev.priceState === '이상치' ? '전체' : '이상치',
          }))
        }
        className={`text-left p-4 rounded-xl border transition-all ${
          filter.priceState === '이상치'
            ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-400/30 shadow-sm'
            : 'bg-white border-slate-200 hover:border-orange-200 hover:bg-orange-50/30'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">단가 이상치 (±30%)</span>
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-orange-600">{outlierCount}건</div>
        <div className="text-[11px] text-slate-400 mt-1">중앙값 대비 초과</div>
      </button>

      {/* 품목명 표기 상이 */}
      <button
        onClick={() =>
          setFilter((prev) => ({
            ...prev,
            onlyMismatch: !prev.onlyMismatch,
          }))
        }
        className={`text-left p-4 rounded-xl border transition-all ${
          filter.onlyMismatch
            ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400/30 shadow-sm'
            : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-purple-50/30'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">표기 상이 품목</span>
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-purple-600">{mismatchCount}행</div>
        <div className="text-[11px] text-slate-400 mt-1">코드 내 명칭 불일치</div>
      </button>

      {/* 발주≠최저가 안내 */}
      <div className="text-left p-4 rounded-xl border bg-white border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">발주 ≠ 최저가</span>
          <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-sky-600">{issuedNotLowestCount}PR</div>
        <div className="text-[11px] text-slate-400 mt-1">차선책 발주 건 확인</div>
      </div>

      {/* 결측 및 미기재 */}
      <button
        onClick={() =>
          setFilter((prev) => ({
            ...prev,
            priceState: prev.priceState === '단가 미기재' ? '전체' : '단가 미기재',
          }))
        }
        className={`text-left p-4 rounded-xl border transition-all ${
          filter.priceState === '단가 미기재'
            ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-400/30 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">단가·납기 미기재</span>
          <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-700">{missingCount}건</div>
        <div className="text-[11px] text-slate-400 mt-1">공란 견적 행</div>
      </button>
    </div>
  );
};
