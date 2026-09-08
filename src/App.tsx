import React, { useState, useEffect, useMemo } from 'react';
import { Quote, FilterState } from './types';
import { DEFAULT_QUOTES } from './data/defaultQuotes';
import { evaluateQuotes } from './utils/evaluator';
import { exportToCSV } from './utils/csvParser';
import { Header } from './components/Header';
import { DashboardCards } from './components/DashboardCards';
import { FilterBar } from './components/FilterBar';
import { QuoteTable } from './components/QuoteTable';
import { PRDetailModal } from './components/PRDetailModal';
import { QuoteFormModal } from './components/QuoteFormModal';
import { ImportModal } from './components/ImportModal';
import { AnalyticsView } from './components/AnalyticsView';

const STORAGE_KEY = 'exs02.quotes.v1';

export default function App() {
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
    return DEFAULT_QUOTES;
  });

  const [filter, setFilter] = useState<FilterState>({
    search: '',
    status: '전체',
    deliveryState: '전체',
    priceState: '전체',
    itemCode: '',
    supplier: '',
    onlyLowest: false,
    onlyMismatch: false,
  });

  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('grouped');
  const [selectedPR, setSelectedPR] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [quoteToEdit, setQuoteToEdit] = useState<Quote | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Save to localStorage with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [quotes]);

  // Evaluate all quotes
  const evaluatedQuotes = useMemo(() => evaluateQuotes(quotes), [quotes]);

  // Filter quotes
  const filteredQuotes = useMemo(() => {
    return evaluatedQuotes.filter((q) => {
      if (filter.status !== '전체' && q.status !== filter.status) return false;
      if (filter.deliveryState !== '전체' && q.deliveryState !== filter.deliveryState) return false;
      if (filter.priceState !== '전체' && q.priceState !== filter.priceState) return false;
      if (filter.onlyLowest && !q.isLowestPrice) return false;
      if (filter.onlyMismatch && !q.isNameMismatch) return false;

      if (filter.search.trim()) {
        const query = filter.search.toLowerCase();
        const matchSearch =
          q.pr_no.toLowerCase().includes(query) ||
          q.quote_id.toLowerCase().includes(query) ||
          q.item_name.toLowerCase().includes(query) ||
          q.item_code.toLowerCase().includes(query) ||
          q.supplier.toLowerCase().includes(query);
        if (!matchSearch) return false;
      }
      return true;
    });
  }, [evaluatedQuotes, filter]);

  // Actions
  const handleToggleStatus = (quoteId: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.quote_id === quoteId ? { ...q, status: q.status === '발주' ? '견적' : '발주' } : q))
    );
  };

  const handleSaveQuote = (quote: Quote) => {
    setQuotes((prev) => {
      const exists = prev.some((q) => q.quote_id === quote.quote_id);
      if (exists) {
        return prev.map((q) => (q.quote_id === quote.quote_id ? quote : q));
      } else {
        return [quote, ...prev];
      }
    });
  };

  const handleDeleteQuote = (quoteId: string) => {
    if (window.confirm(`견적 ${quoteId} 건을 삭제하시겠습니까?`)) {
      setQuotes((prev) => prev.filter((q) => q.quote_id !== quoteId));
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('기본 샘플 데이터(80행)로 초기화하시겠습니까?')) {
      setQuotes(DEFAULT_QUOTES);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(quotes);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase_quotes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased">
      <Header
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAdd={() => {
          setQuoteToEdit(null);
          setIsFormOpen(true);
        }}
        onExportCSV={handleExportCSV}
        onResetDefault={handleResetDefault}
        onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
        showAnalytics={showAnalytics}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Analytics Dashboard Drawer */}
        {showAnalytics && (
          <AnalyticsView quotes={evaluatedQuotes} onClose={() => setShowAnalytics(false)} />
        )}

        {/* Dashboard Cards */}
        <DashboardCards quotes={evaluatedQuotes} filter={filter} setFilter={setFilter} />

        {/* Filter & Controls Bar */}
        <FilterBar
          filter={filter}
          setFilter={setFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onResetFilters={() =>
            setFilter({
              search: '',
              status: '전체',
              deliveryState: '전체',
              priceState: '전체',
              itemCode: '',
              supplier: '',
              onlyLowest: false,
              onlyMismatch: false,
            })
          }
          totalCount={quotes.length}
          filteredCount={filteredQuotes.length}
        />

        {/* Main Quote Table */}
        <QuoteTable
          quotes={filteredQuotes}
          viewMode={viewMode}
          onSelectPR={(prNo) => setSelectedPR(prNo)}
          onToggleStatus={handleToggleStatus}
          onEditQuote={(q) => {
            setQuoteToEdit(q);
            setIsFormOpen(true);
          }}
          onDeleteQuote={handleDeleteQuote}
        />
      </main>

      {/* PR Comparison Detail Modal */}
      <PRDetailModal
        prNo={selectedPR}
        quotes={evaluatedQuotes}
        onClose={() => setSelectedPR(null)}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add/Edit Quote Form Modal */}
      <QuoteFormModal
        isOpen={isFormOpen}
        quoteToEdit={quoteToEdit}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveQuote}
      />

      {/* CSV Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={(imported) => setQuotes(imported)}
      />
    </div>
  );
}
