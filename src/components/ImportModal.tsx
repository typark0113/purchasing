import React, { useState } from 'react';
import { Quote } from '../types';
import { parseCSV } from '../utils/csvParser';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (quotes: Quote[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<Quote[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const quotes = parseCSV(text);
        if (quotes.length === 0) {
          setError('파싱된 데이터가 없습니다. CSV 형식을 확인해주세요.');
        } else {
          setParsedPreview(quotes);
        }
      } catch (err) {
        setError('파일 파싱 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleTextParse = () => {
    if (!pastedText.trim()) {
      setError('텍스트를 입력해주세요.');
      return;
    }
    try {
      const quotes = parseCSV(pastedText);
      if (quotes.length === 0) {
        setError('파싱된 데이터가 없습니다.');
      } else {
        setParsedPreview(quotes);
        setError(null);
      }
    } catch (err) {
      setError('텍스트 파싱 오류');
    }
  };

  const handleConfirm = () => {
    if (parsedPreview && parsedPreview.length > 0) {
      onImport(parsedPreview);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">견적 데이터 반입 (CSV 파일 또는 텍스트)</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {fileName ? fileName : 'CSV 파일 업로드 (ds02_purchase_quotes.csv 등)'}
              </span>
              <span className="text-xs text-slate-400 mt-1">UTF-8 인코딩 쉼표 구분 파일 지원</span>
            </label>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase font-semibold">또는 텍스트 붙여넣기</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Paste Area */}
          <div>
            <textarea
              rows={5}
              placeholder="quote_id,pr_no,item_code,item_name,supplier,unit,qty,unit_price,currency,quote_date,required_date,promised_date,status,remark..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleTextParse}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-medium"
              >
                텍스트 파싱 미리보기
              </button>
            </div>
          </div>

          {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">{error}</div>}

          {parsedPreview && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-900">파싱 성공! ({parsedPreview.length}건 감지됨)</div>
                  <div className="text-xs text-emerald-700">정상적으로 데이터 검증 및 판정이 가능합니다.</div>
                </div>
              </div>
              <button
                onClick={handleConfirm}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm"
              >
                데이터 적용하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
