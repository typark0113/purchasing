import React from 'react';
import { FilterState } from '../types';
import { Search, RotateCcw, LayoutList, TableProperties } from 'lucide-react';

interface FilterBarProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  viewMode: 'table' | 'grouped';
  setViewMode: (mode: 'table' | 'grouped') => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  setFilter,
  viewMode,
  setViewMode,
  onResetFilters,
  totalCount,
  filteredCount,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search & Quick filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="PR번호, 품목명, 품목코드, 공급사 검색..."
              value={filter.search}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter.status}
            onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value as any }))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="전체">상태: 전체</option>
            <option value="견적">상태: 견적</option>
            <option value="발주">상태: 발주</option>
          </select>

          {/* Delivery State Filter */}
          <select
            value={filter.deliveryState}
            onChange={(e) => setFilter((prev) => ({ ...prev, deliveryState: e.target.value as any }))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="전체">납기판정: 전체</option>
            <option value="지연">지연</option>
            <option value="임박">임박 (0~7일)</option>
            <option value="정상">정상</option>
            <option value="납기 미기재">납기 미기재</option>
          </select>

          {/* Price State Filter */}
          <select
            value={filter.priceState}
            onChange={(e) => setFilter((prev) => ({ ...prev, priceState: e.target.value as any }))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="전체">단가판정: 전체</option>
            <option value="정상">정상</option>
            <option value="이상치">이상치 (±30% 초과)</option>
            <option value="단가 미기재">단가 미기재</option>
          </select>

          {/* Checkboxes */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer px-1">
            <input
              type="checkbox"
              checked={filter.onlyLowest}
              onChange={(e) => setFilter((prev) => ({ ...prev, onlyLowest: e.target.checked }))}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            최저가 후보만
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer px-1">
            <input
              type="checkbox"
              checked={filter.onlyMismatch}
              onChange={(e) => setFilter((prev) => ({ ...prev, onlyMismatch: e.target.checked }))}
              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
            />
            표기 상이만
          </label>
        </div>

        {/* View mode toggle & reset */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
          <div className="text-xs text-slate-500">
            조회 <span className="font-semibold text-slate-800">{filteredCount}</span> / {totalCount}건
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                플랫 목록
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'grouped' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                PR별 그룹
              </button>
            </div>

            <button
              onClick={onResetFilters}
              title="필터 초기화"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
