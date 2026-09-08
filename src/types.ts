export interface Quote {
  quote_id: string;
  pr_no: string;
  item_code: string;
  item_name: string;
  supplier: string;
  unit: string;
  qty: number;
  unit_price: number | null;
  currency: string;
  quote_date: string;
  required_date: string;
  promised_date: string | null;
  status: '견적' | '발주';
  remark: string;
}

export interface EvaluatedQuote extends Quote {
  dDay: number | null;
  dDayStr: string;
  priceMedian: number | null;
  priceDeviationPct: number | null;
  priceState: '정상' | '이상치' | '비교 불가' | '단가 미기재';
  isLowestPrice: boolean;
  deliveryState: '지연' | '임박' | '정상' | '납기 미기재' | '판정 대상 아님';
  isOverRequiredDate: boolean;
  isNameMismatch: boolean;
  isIssuedNotLowest: boolean; // 발주건인데 최저가가 아닌 경우
}

export type FilterState = {
  search: string;
  status: '전체' | '견적' | '발주';
  deliveryState: '전체' | '지연' | '임박' | '정상' | '납기 미기재' | '판정 대상 아님';
  priceState: '전체' | '정상' | '이상치' | '단가 미기재';
  itemCode: string;
  supplier: string;
  onlyLowest: boolean;
  onlyMismatch: boolean;
};
