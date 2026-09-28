import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { listTransactions } from '../api/transactions';
import { listAccounts } from '../api/accounts';
import { getCategories, getCategorySubcategories } from '../api/categories';

export function useExpenseData({ enabled = false } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Lookups
  const [accountsList, setAccountsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [subcategoriesList, setSubcategoriesList] = useState([]);
  const [accountsMap, setAccountsMap] = useState({});
  const [categoriesMap, setCategoriesMap] = useState({});
  const [subcategoriesMap, setSubcategoriesMap] = useState({});

  // Period State
  const [periodType, setPeriodType] = useState('MONTHLY');
  const [baseDate, setBaseDate] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filters State
  const [filters, setFilters] = useState({ category_id: '', subcategory_id: '', need_or_want: '', account_id: '' });

  // Data
  const [allExpenses, setAllExpenses] = useState([]);
  const lastFetchedPeriodRef = useRef(null);

  // Load Base Lookups (Accounts & Categories)
  useEffect(() => {
    let isMounted = true;
    const loadLookups = async () => {
      try {
        const [accRes, catRes] = await Promise.all([listAccounts(), getCategories()]);
        if (!isMounted) return;
        const acts = accRes.data || [];
        const cats = catRes.data || [];
        setAccountsList(acts);
        setCategoriesList(cats);
        
        const aMap = {}; acts.forEach(a => { aMap[a.id] = a.name; });
        setAccountsMap(aMap);
        const cMap = {}; cats.forEach(c => { cMap[c.id] = c.name; });
        setCategoriesMap(cMap);
      } catch (err) {
        console.error("Lookup data failed to load", err);
      }
    };
    loadLookups();
    return () => { isMounted = false; };
  }, []);

  // Load Subcategories when Category changes
  useEffect(() => {
    let isMounted = true;
    const loadSubs = async () => {
      if (!filters.category_id) {
        setSubcategoriesList([]);
        return;
      }
      try {
        const res = await getCategorySubcategories(filters.category_id);
        if (!isMounted) return;
        const subs = res.data || [];
        
        // Reset selected subcategory if it doesn't belong to the new category
        const subExists = subs.find(s => s.id === filters.subcategory_id);
        if (!subExists && filters.subcategory_id) {
          setFilters(prev => ({ ...prev, subcategory_id: '' }));
        }

        setSubcategoriesList(subs);
        setSubcategoriesMap(prev => {
          const m = { ...prev };
          subs.forEach(s => { m[s.id] = s.name; });
          return m;
        });
      } catch (err) {
        console.error("Subcategories failed", err);
        setSubcategoriesList([]);
      }
    };
    loadSubs();
    return () => { isMounted = false; };
  }, [filters.category_id]); // omitting filters.subcategory_id from deps intentionally

  // Calculate Date Range
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

  // Fetch all transactions for the period
  const fetchExpenses = useCallback(async (force = false) => {
    if (!enabled) return;
    
    const { start_date, end_date } = getDateRange();
    if (periodType === 'CUSTOM' && (!start_date || !end_date)) return;

    const periodKey = `${periodType}_${start_date}_${end_date}`;
    if (!force && lastFetchedPeriodRef.current === periodKey) {
      return; // Already fetched for this period
    }

    setLoading(true);
    setError(null);
    try {
      let all = [];
      let currentPage = 1;
      
      while (true) {
        const res = await listTransactions({
          transaction_type: 'EXPENSE',
          start_date,
          end_date,
          page: currentPage,
          page_size: 100
        });
        const data = res.data || [];
        all = [...all, ...data];
        if (data.length < 100) break;
        currentPage++;
      }
      setAllExpenses(all);
      lastFetchedPeriodRef.current = periodKey;
    } catch (err) {
      setError("Failed to fetch expenses.");
    } finally {
      setLoading(false);
    }
  }, [getDateRange, periodType, enabled]);

  // Trigger fetch when period changes and enabled is true
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

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

  // Derived Pipeline: Filtered
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(tx => {
      if (filters.category_id && tx.category_id !== filters.category_id) return false;
      if (filters.subcategory_id && tx.subcategory_id !== filters.subcategory_id) return false;
      if (filters.need_or_want && tx.need_or_want !== filters.need_or_want) return false;
      if (filters.account_id && tx.account_id !== filters.account_id) return false;
      return true;
    });
  }, [allExpenses, filters]);

  // Analytics Calculations (based on filtered expenses, not searched)
  const summaryData = useMemo(() => {
    let tExp = 0, tNeed = 0, tWant = 0;
    const catMap = {};

    filteredExpenses.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      tExp += amt;
      if (tx.need_or_want === 'NEED') tNeed += amt;
      if (tx.need_or_want === 'WANT') tWant += amt;

      const catId = tx.category_id || 'unknown';
      catMap[catId] = (catMap[catId] || 0) + amt;
    });

    const cData = Object.entries(catMap).map(([id, val]) => ({
      name: id === 'unknown' ? 'Unknown' : (categoriesMap[id] || 'Unknown'),
      val
    })).filter(e => isFinite(e.val) && e.val > 0).sort((a, b) => b.val - a.val);

    return { totalExpense: tExp, totalNeeds: tNeed, totalWants: tWant, categoryData: cData };
  }, [filteredExpenses, categoriesMap]);

  return {
    loading,
    error,
    
    // Lookups
    accountsList, categoriesList, subcategoriesList,
    accountsMap, categoriesMap, subcategoriesMap,
    
    // Period State & Helpers
    periodType, setPeriodType,
    baseDate, setBaseDate,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate,
    shiftPeriod, getPeriodLabel, getDateRange,
    fetchExpenses,
    
    // Filter State
    filters, setFilters,
    
    // Data
    allExpenses,
    filteredExpenses,
    summaryData
  };
}
