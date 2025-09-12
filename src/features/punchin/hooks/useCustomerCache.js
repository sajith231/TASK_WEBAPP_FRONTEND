import { useCallback } from 'react';
import { logger } from '../../../utils/logger';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Custom hook for customer caching functionality
const useCustomerCache = () => {
  const getCachedCustomers = useCallback(() => {
    try {
      const cached = sessionStorage.getItem('customers_cache');
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      
      return isExpired ? null : data;
    } catch (error) {
      logger.error('Failed to parse cached customers:', error);
      sessionStorage.removeItem('customers_cache');
      return null;
    }
  }, []);

  const setCachedCustomers = useCallback((customers) => {
    try {
      const cacheData = {
        data: customers,
        timestamp: Date.now()
      };
      sessionStorage.setItem('customers_cache', JSON.stringify(cacheData));
    } catch (error) {
      logger.error('Failed to cache customers:', error);
    }
  }, []);

  return { getCachedCustomers, setCachedCustomers };
};

export default useCustomerCache;
