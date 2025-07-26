export interface SpendingData {
  category: string;
  current: number;
  projected: number;
  growthRate: number;
}

export interface MarketSizeData {
  month: string;
  value: number;
}

export interface DemographicData {
  totalPopulation: number;
  medianIncome: number;
  homeOwnership: number;
  gasRangeIndex: number;
  electricRangeIndex: number;
  recentBuyersIndex: number;
  recentMoversPercent: number;
  totalHousingUnits: number;
}

export interface MarketPotentialData {
  totalPotential: number;
  growthRate: number;
  marketPenetration: number;
  storeExpenditureIndex: number;
}

export interface LayerState {
  layer: __esri.FeatureLayer | null;
  visible: boolean;
  loading: boolean;
  error?: string;
  group: string;
  filters: any[];
  active: boolean;
  name: string;
  queryResults?: {
    features: any[];
    fields: any[];
  };
} 