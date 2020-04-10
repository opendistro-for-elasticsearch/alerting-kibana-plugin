import { SEARCH_TYPE } from '../../../../../utils/constants';

export const initializeFromQueryParams = queryParams => {
  return {
    searchType: queryParams.searchType || undefined,
    name: queryParams.name ? `${queryParams.name}-Monitor` : undefined,
    detectorId: queryParams.adId || undefined,
    period:
      queryParams.interval && queryParams.unit
        ? { interval: parseInt(queryParams.interval), unit: queryParams.unit }
        : undefined,
  };
};
