import { createContext } from 'react';

import type { BarChartTranslations } from './shared/translations';
import { defaultBarChartTranslations } from './shared/translations';
import type { BarChartStyles, MaxScaleValue } from './shared/types';

export interface BarChartContextProps {
  maxScaleValue: MaxScaleValue;
  scaleInterval: number;
  unit: string;
  styleConfig: Required<BarChartStyles>;
  animate: boolean;
  widestCategoryLabelWidth: number | null;
  setWidestCategoryLabelWidth: (width: number) => void;
  widestTotalValueLabelWidth: number | null;
  setWidestTotalValueLabelWidth: (width: number) => void;
  isMeasuring: boolean;
  translations: BarChartTranslations;
}

export const defaultStyleConfig: Required<BarChartStyles> = {
  textColor: 'text-default',
  seriesOneBarColor: 'text-default',
  seriesTwoBarColor: 'action-primary',
  seriesOneLabel: 'text-subtle',
  seriesTwoLabel: 'action-primary',
};

export const BarChartContext = createContext<BarChartContextProps>({
  maxScaleValue: 100,
  scaleInterval: 10,
  unit: '',
  styleConfig: defaultStyleConfig,
  animate: false,
  widestCategoryLabelWidth: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setWidestCategoryLabelWidth: () => {},
  widestTotalValueLabelWidth: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setWidestTotalValueLabelWidth: () => {
    // No-op: default context value
  },
  isMeasuring: true,
  translations: defaultBarChartTranslations,
});

export const BarChartProvider = BarChartContext.Provider;
