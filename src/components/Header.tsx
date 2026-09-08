import React from 'react';
import { Upload, Plus, Download, RotateCcw, BarChart2 } from 'lucide-react';

interface HeaderProps {
  onOpenImport: () => void;
  onOpenAdd: () => void;
  onExportCSV: () => void;
  onResetDefault: () => void;
  onToggleAnalytics: () => void;
  showAnalytics: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenImport,
  onOpenAdd,
  onExportCSV,
  onResetDefault,
  onToggleAnalytics,
  showAnalytics,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            PR
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">구매 견적 비교 · 납기 판정기</h1>
            <p className="text-xs text-slate-500">PR별 복수 공급사 견적 분석 및 납기(기준일 2026-08-27) 자동 판정</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAnalytics}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border ${
              showAnalytics
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            통계 요약
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            CSV 반입
          </button>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            CSV 내보내기
          </button>

          <button
            onClick={onOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            견적 등록
          </button>

          <button
            onClick={onResetDefault}
            title="기본 샘플 데이터(80행)로 초기화"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
