import { useState, useCallback, useEffect } from 'react';
import apiClient from '../api/client';

export function useIncomeData({ enabled = true } = {}) {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  // Period State
  const [periodType, setPeriodType] = useState('MONTHLY');
  const [baseDate, setBaseDate] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filters State
  const [filters, setFilters] = useState({ account_id: '' });

  const getDateRange = useCallback(() => {
    const start = new Date(baseDate);
    const end = new Date(baseDate);
    
    if (periodType === 'DAILY') {
      // already set
    } else if (periodType === 'WEEKLY') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      end.setDate(start.getDate() + 6);
    } else if (periodType === 'MONTHLY') {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    } else if (periodType === 'YEARLY') {
      start.setMonth(0, 1);
      end.setFullYear(end.getFullYear() + 1, 0, 0);
    } else if (periodType === 'CUSTOM') {
      return { start_date: customStartDate, end_date: customEndDate };
    }
    
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0]
    };
  }, [baseDate, periodType, customStartDate, customEndDate]);

  const fetchIncomeData = useCallback(async (pageNum = 1, forceReset = false) => {
    if (!enabled) return;
    
    const { start_date, end_date } = getDateRange();
    if (periodType === 'CUSTOM' && (!start_date || !end_date)) return;

    let queryParams = `?transaction_type=INCOME&page=${pageNum}&page_size=20`;
    let summaryParams = `?`;
    if (start_date) {
      queryParams += `&start_date=${start_date}`;
      summaryParams += `start_date=${start_date}&`;
    }
    if (end_date) {
      queryParams += `&end_date=${end_date}`;
      summaryParams += `end_date=${end_date}&`;
    }
    if (filters.account_id) {
      queryParams += `&account_id=${filters.account_id}`;
      summaryParams += `account_id=${filters.account_id}&`;
    }

    try {
      if (pageNum === 1) setLoading(true);
      setError(null);

      // We parallelize the requests if it's the first page
      if (pageNum === 1) {
        const [summaryRes, listRes] = await Promise.all([
          apiClient.get(`/api/income/summary${summaryParams}`),
          apiClient.get(`/api/transactions${queryParams}`)
        ]);
        setSummary(summaryRes.data);
        setTransactions(listRes.data);
        setHasMore(listRes.data.length === 20);
      } else {
        const listRes = await apiClient.get(`/api/transactions${queryParams}`);
        setTransactions(prev => forceReset ? listRes.data : [...prev, ...listRes.data]);
        setHasMore(listRes.data.length === 20);
      }
      setHasFetched(true);
    } catch (err) {
      console.error(err);
      setError("Failed to load income history.");
    } finally {
      if (pageNum === 1) setLoading(false);
    }
  }, [enabled, getDateRange, periodType, filters.account_id]);

  // Helper to shift period
  const shiftPeriod = (dir) => {
    const d = new Date(baseDate);
    if (periodType === 'DAILY') d.setDate(d.getDate() + dir);
    else if (periodType === 'WEEKLY') d.setDate(d.getDate() + dir * 7);
    else if (periodType === 'MONTHLY') d.setMonth(d.getMonth() + dir);
    else if (periodType === 'YEARLY') d.setFullYear(d.getFullYear() + dir);
    setBaseDate(d);
  };

  const getPeriodLabel = () => {
    if (periodType === 'DAILY') return baseDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    if (periodType === 'WEEKLY') {
      const { start_date, end_date } = getDateRange();
      return `${start_date} to ${end_date}`;
    }
    if (periodType === 'MONTHLY') return baseDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    if (periodType === 'YEARLY') return baseDate.getFullYear().toString();
    return 'Custom Range';
  };

  // Trigger fetch when filters or period changes
  useEffect(() => {
    if (enabled && !hasFetched) {
      fetchIncomeData(1, true);
    } else if (enabled) {
      // If we already fetched at least once, any change in fetchIncomeData dependencies
      // means filters changed, so we should reset to page 1.
      fetchIncomeData(1, true);
    }
  }, [fetchIncomeData, enabled, hasFetched]);

  return {
    summary,
    transactions,
    loading,
    error,
    page,
    setPage,
    hasMore,
    hasFetched,
    fetchIncomeData,
    setPeriodType,
    getDateRange,
    baseDate,
    setBaseDate,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    shiftPeriod,
    getPeriodLabel,
    filters,
    setFilters
  };
}
