import React from 'react';
import { EvaluatedQuote } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { X, TrendingUp, ShieldAlert, Clock } from 'lucide-react';

interface AnalyticsViewProps {
  quotes: EvaluatedQuote[];
  onClose: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ quotes, onClose }) => {
  // 1. Delivery states count for issued quotes
  const issuedQuotes = quotes.filter((q) => q.status === '발주');
  const deliveryCounts = {
    지연: issuedQuotes.filter((q) => q.deliveryState === '지연').length,
    임박: issuedQuotes.filter((q) => q.deliveryState === '임박').length,
    정상: issuedQuotes.filter((q) => q.deliveryState === '정상').length,
    '납기 미기재': issuedQuotes.filter((q) => q.deliveryState === '납기 미기재').length,
  };

  const deliveryData = Object.entries(deliveryCounts).map(([name, value]) => ({ name, value }));

  // 2. Supplier quote counts
  const supplierMap: { [supplier: string]: number } = {};
  quotes.forEach((q) => {
    supplierMap[q.supplier] = (supplierMap[q.supplier] || 0) + 1;
  });
  const supplierData = Object.entries(supplierMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#64748b', '#3b82f6', '#8b5cf6'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">구매 견적 및 납기 통계 대시보드</h2>
            <p className="text-xs text-slate-500">전체 {quotes.length}건 견적 및 발주 납기 분포 현황</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery State Chart */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" /> 발주 건 납기 3구간 분포 현황
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Distribution */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-600" /> 공급사별 견적 접수 건수
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
