import { SEARCH_TYPE } from '../../../../../utils/constants';

export const initializeFromQueryParams = queryParams => {
  return {
    searchType: queryParams.searchType || undefined,
    name: queryParams.name ? `${queryParams.name}-Monitor` : undefined,
    detectorId: queryParams.adId || undefined,
  };
};
