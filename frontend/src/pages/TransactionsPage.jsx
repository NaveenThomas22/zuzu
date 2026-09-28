import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listTransactions } from '../api/transactions';
import { listAccounts } from '../api/accounts';
import { getCategories, getCategorySubcategories } from '../api/categories';
import { getErrorMessage } from '../api/client';
import PixelIcon from '../components/PixelIcon';
import PixelCard from '../components/PixelCard';
import PixelButton from '../components/PixelButton';
import PixelInput from '../components/PixelInput';
import EmptyState from '../components/EmptyState';
import PixelLoader from '../components/PixelLoader';
import PixelError from '../components/PixelError';
import BottomNav from '../components/BottomNav';
import TransactionEditModal from '../components/TransactionEditModal';
import TransactionDeleteModal from '../components/TransactionDeleteModal';
import { canModifyTransaction } from '../utils/transactionUtils';

const TRANSACTION_TYPES = [
  'OPENING_BALANCE', 'INCOME', 'EXPENSE', 'LENDING_OUT', 
  'LENDING_REPAYMENT', 'INVESTMENT', 'REFUND'
];

const getTxStyle = (type) => {
  switch (type) {
    case 'INCOME':
    case 'REFUND': 
      return { color: 'text-green-600', iconBg: 'bg-mint' };
    case 'EXPENSE': 
      return { color: 'text-pink-pp', iconBg: 'bg-pink-pp/20' };
    case 'LENDING_OUT': 
      return { color: 'text-yellow-600', iconBg: 'bg-yellow-pp' };
    case 'LENDING_REPAYMENT': 
      return { color: 'text-cyan-600', iconBg: 'bg-cyan-light' };
    case 'INVESTMENT': 
      return { color: 'text-lavender', iconBg: 'bg-lavender' };
    case 'OPENING_BALANCE':
    default: 
      return { color: 'text-ink', iconBg: 'bg-cream' };
  }
};

const getTxIcon = (type) => {
  if (!type) return 'other';
  return type.toLowerCase().replace('_', '-');
};

const formatDatetime = (dtString) => {
  if (!dtString) return '';
  try {
    const d = new Date(dtString);
    const datePart = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} • ${timePart}`;
  } catch (e) {
    return dtString;
  }
};

const TransactionsPage = () => {
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mapping Dictionaries
  const [accountsMap, setAccountsMap] = useState({});
  const [categoriesMap, setCategoriesMap] = useState({});
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  
  // Select Options Data
  const [accountsList, setAccountsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [subcategoriesList, setSubcategoriesList] = useState([]);

  // Filters State (what is selected in UI)
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    transaction_type: '',
    category_id: '',
    subcategory_id: '',
    account_id: '',
    need_or_want: ''
  });
  
  // Active Filters (what is actually applied to the API)
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Modal
  const [selectedTx, setSelectedTx] = useState(null);
  
  // Edit & Delete Modals
  const [editTx, setEditTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);

  // Initial lookup data fetch
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [accRes, catRes] = await Promise.all([
          listAccounts(),
          getCategories()
        ]);
        
        const acts = accRes.data || [];
        const cats = catRes.data || [];
        
        setAccountsList(acts);
        setCategoriesList(cats);
        
        const aMap = {};
        acts.forEach(a => { aMap[a.id] = a.name; });
        setAccountsMap(aMap);
        
        const cMap = {};
        cats.forEach(c => { cMap[c.id] = c.name; });
        setCategoriesMap(cMap);
        
      } catch (err) {
        console.error("Lookup data failed to load", err);
      }
    };
    loadLookups();
  }, []);

  // Effect to load subcategories when category changes
  useEffect(() => {
    const loadSubs = async () => {
      if (!filters.category_id) {
        setSubcategoriesList([]);
        return;
      }
      try {
        const res = await getCategorySubcategories(filters.category_id);
        const subs = res.data || [];
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
  }, [filters.category_id]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams = { ...activeFilters, page, page_size: pageSize };
      
      // Cleanup empty params
      Object.keys(apiParams).forEach(key => {
        if (apiParams[key] === '' || apiParams[key] === undefined || apiParams[key] === null) {
          delete apiParams[key];
        }
      });

      const res = await listTransactions(apiParams);
      // Backend returns plain array
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(getErrorMessage(err) || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [activeFilters, page, pageSize]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleApplyFilters = () => {
    setActiveFilters({ ...filters });
    setPage(1);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const resetState = {
      start_date: '', end_date: '', transaction_type: '',
      category_id: '', subcategory_id: '', account_id: '', need_or_want: ''
    };
    setFilters(resetState);
    setActiveFilters(resetState);
    setPage(1);
    setShowFilters(false);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setPage(1);
  };

  const hasNextPage = transactions.length === pageSize;
  const hasPrevPage = page > 1;

  return (
    <main className="max-w-md mx-auto min-h-screen bg-cream pb-32 relative overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-cyan-light border-b-[3px] border-ink relative z-10 sticky top-0 shadow-pixel-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} disabled={loading}>
            <PixelIcon name="arrow-left" size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="font-pixel text-base text-ink uppercase">TRANSACTION</h1>
            <h1 className="font-pixel text-base text-ink uppercase -mt-1">HISTORY</h1>
          </div>
        </div>
        <PixelIcon name="money-stack" size={24} />
      </div>

      <div className="p-4 flex flex-col gap-4 relative z-10">
        
        {/* Filter Toggle */}
        <div className="flex justify-between items-center border-[3px] border-ink bg-cream p-2 shadow-pixel-sm">
          <span className="font-pixel text-[10px] text-ink uppercase flex items-center gap-2">
            FILTERS <span className="text-[8px] opacity-70">Pg {page}</span>
          </span>
          <button 
            className="font-retro text-xs text-ink underline"
            onClick={() => setShowFilters(!showFilters)}
            disabled={loading}
          >
            {showFilters ? 'HIDE' : 'SHOW'}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-[3px] border-ink bg-lavender p-3 shadow-pixel-sm flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">START DATE</label>
                <PixelInput 
                  type="date" 
                  value={filters.start_date}
                  onChange={e => setFilters({...filters, start_date: e.target.value})}
                  disabled={loading}
                  className="py-1 text-xs"
                />
              </div>
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">END DATE</label>
                <PixelInput 
                  type="date" 
                  value={filters.end_date}
                  onChange={e => setFilters({...filters, end_date: e.target.value})}
                  disabled={loading}
                  className="py-1 text-xs"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">TYPE</label>
                <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none"
                  value={filters.transaction_type} onChange={e => setFilters({...filters, transaction_type: e.target.value})} disabled={loading}>
                  <option value="">ALL</option>
                  {TRANSACTION_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">NEED / WANT</label>
                <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none"
                  value={filters.need_or_want} onChange={e => setFilters({...filters, need_or_want: e.target.value})} disabled={loading}>
                  <option value="">ALL</option>
                  <option value="NEED">NEED</option>
                  <option value="WANT">WANT</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-pixel text-[8px] text-ink block mb-1">ACCOUNT</label>
              <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none"
                value={filters.account_id} onChange={e => setFilters({...filters, account_id: e.target.value})} disabled={loading}>
                <option value="">All Accounts</option>
                {accountsList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">CATEGORY</label>
                <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none truncate"
                  value={filters.category_id} onChange={e => setFilters({...filters, category_id: e.target.value, subcategory_id: ''})} disabled={loading}>
                  <option value="">All Categories</option>
                  {categoriesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">SUBCATEGORY</label>
                <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none truncate"
                  value={filters.subcategory_id} onChange={e => setFilters({...filters, subcategory_id: e.target.value})} disabled={loading || !filters.category_id}>
                  <option value="">All Subcategories</option>
                  {subcategoriesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-2 pt-3 border-t-[3px] border-ink border-dashed">
              <button className="font-pixel text-[10px] text-ink hover:underline flex-1 py-1 text-center" onClick={handleResetFilters} disabled={loading}>
                RESET
              </button>
              <PixelButton variant="cyan" className="flex-1 py-1 text-xs" onClick={handleApplyFilters} disabled={loading}>
                APPLY FILTERS
              </PixelButton>
            </div>
          </div>
        )}

        {error && <PixelError message={error} onRetry={fetchTransactions} />}

        {/* List */}
        {loading ? (
           <div className="flex justify-center p-8"><PixelLoader /></div>
        ) : transactions.length === 0 ? (
          <EmptyState 
            title="NO TRANSACTIONS YET!" 
            message="Your money story starts here."
            ctaLabel="+ ADD TRANSACTION"
            ctaTo="/add"
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center bg-cream px-1">
              <span className="font-pixel text-[8px] text-ink/70">Showing {transactions.length} records</span>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[8px] text-ink/70">PER PAGE</span>
                <select className="bg-cream border-[1px] border-ink p-0.5 font-retro text-[10px] focus:outline-none"
                  value={pageSize} onChange={handlePageSizeChange}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            
            {transactions.map(tx => {
              const style = getTxStyle(tx.transaction_type);
              const isIncomeVariant = tx.transaction_type === 'INCOME' || tx.transaction_type === 'REFUND';
              const sign = isIncomeVariant ? '+' : (tx.transaction_type === 'OPENING_BALANCE' ? '' : '-');
              
              return (
                <div 
                  key={tx.id} 
                  className="flex flex-col border-[3px] border-ink shadow-pixel-sm p-3 bg-cream cursor-pointer hover:bg-yellow-pp/10 transition-colors"
                  onClick={() => setSelectedTx(tx)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-pixel text-[8px] px-1 bg-ink/5 text-ink/70">
                      {tx.transaction_date}
                    </span>
                    {tx.need_or_want && (
                      <span className={`font-pixel text-[8px] px-1 ${tx.need_or_want === 'NEED' ? 'bg-mint' : 'bg-pink-pp'} text-ink`}>
                        {tx.need_or_want}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`border-[2px] border-ink p-1 ${style.iconBg}`}>
                        <PixelIcon name={getTxIcon(tx.transaction_type)} size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-pixel text-[10px] uppercase text-ink truncate max-w-[150px]">
                          {tx.item_name || tx.transaction_type.replace('_', ' ')}
                        </span>
                        {(tx.category_id || tx.account_id) && (
                          <span className="font-retro text-[10px] text-ink/70 truncate max-w-[150px]">
                            {tx.category_id && categoriesMap[tx.category_id] ? categoriesMap[tx.category_id] : ''}
                            {tx.category_id && tx.account_id && ' • '}
                            {tx.account_id && accountsMap[tx.account_id] ? accountsMap[tx.account_id] : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`font-pixel text-sm ${style.color} whitespace-nowrap`}>
                      {sign}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {canModifyTransaction(tx) ? (
                    <div className="flex gap-2 mt-3 pt-3 border-t-[2px] border-ink/10" onClick={e => e.stopPropagation()}>
                      <PixelButton variant="cyan" onClick={() => setEditTx(tx)} className="flex-1 py-1 text-[10px]">
                        EDIT
                      </PixelButton>
                      <PixelButton variant="pink" onClick={() => setDeleteTx(tx)} className="flex-1 py-1 text-[10px]">
                        DELETE
                      </PixelButton>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t-[2px] border-ink/10 text-center">
                       <span className="font-pixel text-[8px] text-ink/40 uppercase">
                          {tx.bill_id ? 'BILL LINKED' : tx.transaction_type.replace('_', ' ')}
                       </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination UI */}
        {!loading && transactions.length > 0 && (
          <div className="flex justify-between items-center bg-cream border-[3px] border-ink p-2 mt-2 shadow-pixel-sm">
            <PixelButton 
              variant="yellow" 
              className="py-1 px-3 text-xs" 
              disabled={!hasPrevPage} 
              onClick={() => setPage(p => p - 1)}
            >
              ← PREV
            </PixelButton>
            <span className="font-pixel text-[10px] text-ink uppercase">PAGE {page}</span>
            <PixelButton 
              variant="cyan" 
              className="py-1 px-3 text-xs" 
              disabled={!hasNextPage} 
              onClick={() => setPage(p => p + 1)}
            >
              NEXT →
            </PixelButton>
          </div>
        )}
      </div>

      {/* Detail Overlay */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-cream flex flex-col max-w-md mx-auto overflow-y-auto">
          <div className="flex items-center justify-between p-4 bg-yellow-pp border-b-[3px] border-ink sticky top-0 z-10 shadow-pixel-sm">
            <h1 className="font-pixel text-base text-ink uppercase truncate">TRANSACTION DETAILS</h1>
            <button onClick={() => setSelectedTx(null)} className="p-1 hover:bg-black/10">
              <PixelIcon name="home" size={24} />
            </button>
          </div>
          
          <div className="p-4 flex flex-col gap-4 pb-24">
            
            <div className="border-[3px] border-ink bg-cyan-light p-4 shadow-pixel-sm text-center">
              <span className="font-pixel text-xs text-ink/70 block mb-1">{selectedTx.transaction_date}</span>
              <span className={`font-pixel text-2xl block mb-2 ${getTxStyle(selectedTx.transaction_type).color}`}>
                ₹{Number(selectedTx.amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
              <span className="font-pixel text-[10px] px-2 py-1 bg-cream border-[2px] border-ink inline-block">
                {selectedTx.transaction_type.replace('_', ' ')}
              </span>
            </div>

            <PixelCard tape className="flex flex-col gap-3">
              {selectedTx.item_name && (
                <div>
                  <span className="font-pixel text-[8px] text-ink/50 uppercase block">ITEM</span>
                  <span className="font-retro text-sm text-ink">{selectedTx.item_name}</span>
                </div>
              )}
              {selectedTx.account_id && (
                <div>
                  <span className="font-pixel text-[8px] text-ink/50 uppercase block">ACCOUNT</span>
                  <span className="font-retro text-sm text-ink">{accountsMap[selectedTx.account_id] || selectedTx.account_id}</span>
                </div>
              )}
              {selectedTx.category_id && (
                <div>
                  <span className="font-pixel text-[8px] text-ink/50 uppercase block">CATEGORY</span>
                  <span className="font-retro text-sm text-ink">{categoriesMap[selectedTx.category_id] || selectedTx.category_id}</span>
                </div>
              )}
              {selectedTx.subcategory_id && (
                <div>
                  <span className="font-pixel text-[8px] text-ink/50 uppercase block">SUBCATEGORY</span>
                  <span className="font-retro text-sm text-ink">{subcategoriesMap[selectedTx.subcategory_id] || selectedTx.subcategory_id}</span>
                </div>
              )}
              {selectedTx.need_or_want && (
                <div>
                  <span className="font-pixel text-[8px] text-ink/50 uppercase block">CLASSIFICATION</span>
                  <span className="font-retro text-sm text-ink">{selectedTx.need_or_want}</span>
                </div>
              )}
              {selectedTx.description && (
                <div>
                  <span className="font-pixel text-[8px] text-ink/50 uppercase block">DESCRIPTION</span>
                  <span className="font-retro text-sm text-ink break-words">{selectedTx.description}</span>
                </div>
              )}
              
              <div className="pt-2 mt-2 border-t-[2px] border-ink/20 flex flex-col gap-1">
                <div>
                  <span className="font-pixel text-[8px] text-ink/50 uppercase block">CREATED AT</span>
                  <span className="font-retro text-xs text-ink">{formatDatetime(selectedTx.created_at)}</span>
                </div>
                {selectedTx.updated_at && selectedTx.updated_at !== selectedTx.created_at && (
                  <div>
                    <span className="font-pixel text-[8px] text-ink/50 uppercase block">UPDATED AT</span>
                    <span className="font-retro text-xs text-ink">{formatDatetime(selectedTx.updated_at)}</span>
                  </div>
                )}
              </div>
            </PixelCard>
            
            <PixelButton 
              variant="yellow" 
              onClick={() => setSelectedTx(null)}
              className="w-full text-sm mt-2 shadow-pixel-sm"
            >
              CLOSE
            </PixelButton>
          </div>
        </div>
      )}

      <TransactionEditModal
        transaction={editTx}
        isOpen={!!editTx}
        onClose={() => setEditTx(null)}
        onSuccess={fetchTransactions}
      />

      <TransactionDeleteModal
        transaction={deleteTx}
        isOpen={!!deleteTx}
        onClose={() => setDeleteTx(null)}
        onSuccess={fetchTransactions}
      />
    </main>
  );
};

export default TransactionsPage;
