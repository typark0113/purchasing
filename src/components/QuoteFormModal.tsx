import React, { useState, useEffect } from 'react';
import { Quote } from '../types';
import { X } from 'lucide-react';

interface QuoteFormModalProps {
  isOpen: boolean;
  quoteToEdit: Quote | null;
  onClose: () => void;
  onSave: (quote: Quote) => void;
}

export const QuoteFormModal: React.FC<QuoteFormModalProps> = ({
  isOpen,
  quoteToEdit,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Quote>({
    quote_id: `QT-${Math.floor(100 + Math.random() * 900)}`,
    pr_no: 'PR-2026-100',
    item_code: 'IT-001',
    item_name: 'MTBE 수입품',
    supplier: '신규공급사',
    unit: 't',
    qty: 10,
    unit_price: 850000,
    currency: 'KRW',
    quote_date: new Date().toISOString().split('T')[0],
    required_date: '2026-09-30',
    promised_date: '2026-09-25',
    status: '견적',
    remark: '',
  });

  useEffect(() => {
    if (quoteToEdit) {
      setFormData(quoteToEdit);
    } else {
      setFormData({
        quote_id: `QT-${Math.floor(100 + Math.random() * 900)}`,
        pr_no: 'PR-2026-100',
        item_code: 'IT-001',
        item_name: 'MTBE 수입품',
        supplier: '신규공급사',
        unit: 't',
        qty: 10,
        unit_price: 850000,
        currency: 'KRW',
        quote_date: new Date().toISOString().split('T')[0],
        required_date: '2026-09-30',
        promised_date: '2026-09-25',
        status: '견적',
        remark: '',
      });
    }
  }, [quoteToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {quoteToEdit ? '견적 정보 수정' : '신규 견적 단건 등록'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">견적번호 (Quote ID)</label>
              <input
                type="text"
                required
                value={formData.quote_id}
                onChange={(e) => setFormData({ ...formData, quote_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">PR 번호</label>
              <input
                type="text"
                required
                value={formData.pr_no}
                onChange={(e) => setFormData({ ...formData, pr_no: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">품목 코드</label>
              <input
                type="text"
                required
                value={formData.item_code}
                onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">품목명</label>
              <input
                type="text"
                required
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">공급사</label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">단위</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">수량</label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">단가 (KRW, 공란 가능)</label>
              <input
                type="number"
                value={formData.unit_price ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit_price: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                placeholder="미입력 시 공란"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">상태</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as '견적' | '발주' })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="견적">견적</option>
                <option value="발주">발주</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">견적 접수일</label>
              <input
                type="date"
                required
                value={formData.quote_date}
                onChange={(e) => setFormData({ ...formData, quote_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">요청 필요일</label>
              <input
                type="date"
                required
                value={formData.required_date}
                onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">약속 납기일 (공란 가능)</label>
              <input
                type="date"
                value={formData.promised_date || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    promised_date: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">비고</label>
            <input
              type="text"
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              placeholder="특이사항 입력..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
