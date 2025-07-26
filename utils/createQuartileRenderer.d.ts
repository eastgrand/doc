declare module '@/utils/createQuartileRenderer' {
    export function createQuartileRenderer(
      layer: __esri.FeatureLayer,
      field: string
    ): Promise<__esri.ClassBreaksRenderer | null>;
  }