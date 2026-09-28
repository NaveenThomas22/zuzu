import React, { useState, useMemo, useEffect } from 'react';
import PixelIcon from './PixelIcon';
import PixelCard from './PixelCard';
import PixelButton from './PixelButton';
import PixelInput from './PixelInput';
import PixelLoader from './PixelLoader';
import PixelError from './PixelError';
import EmptyState from './EmptyState';
import ExpensePeriodSelector from './ExpensePeriodSelector';
import ExpenseFilters from './ExpenseFilters';
import TransactionEditModal from './TransactionEditModal';
import TransactionDeleteModal from './TransactionDeleteModal';
import ExportPdfButton from './ExportPdfButton';
import { canModifyTransaction } from '../utils/transactionUtils';

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

export default function ExpenseList({ expenseData }) {
  const {
    loading, error,
    periodType, setPeriodType,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate,
    shiftPeriod, getPeriodLabel,
    fetchExpenses,
    filters, setFilters,
    categoriesList, subcategoriesList, accountsList,
    accountsMap, categoriesMap, subcategoriesMap,
    filteredExpenses
  } = expenseData;

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTx, setSelectedTx] = useState(null);

  const [editTx, setEditTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);

  // Reset pagination when search or filters change
  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery, periodType, customStartDate, customEndDate]);

  // Local Pipeline: Searched -> Paginated
  const searchedExpenses = useMemo(() => {
    if (!searchQuery) return filteredExpenses;
    const q = searchQuery.toLowerCase();
    return filteredExpenses.filter(tx => {
      const itemName = (tx.item_name || '').toLowerCase();
      const desc = (tx.description || '').toLowerCase();
      const cat = (categoriesMap[tx.category_id] || '').toLowerCase();
      const sub = (subcategoriesMap[tx.subcategory_id] || '').toLowerCase();
      return itemName.includes(q) || desc.includes(q) || cat.includes(q) || sub.includes(q);
    });
  }, [filteredExpenses, searchQuery, categoriesMap, subcategoriesMap]);

  const paginatedExpenses = useMemo(() => {
    let currentPage = page;
    const maxPage = Math.max(1, Math.ceil(searchedExpenses.length / pageSize));
    if (currentPage > maxPage) {
      currentPage = maxPage;
      setPage(currentPage);
    }
    const startIndex = (currentPage - 1) * pageSize;
    return searchedExpenses.slice(startIndex, startIndex + pageSize);
  }, [searchedExpenses, page, pageSize]);

  // Total for the currently *searched* list (to show at bottom of table)
  const totalExpense = useMemo(() => {
    return searchedExpenses.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [searchedExpenses]);

  const hasNextPage = searchedExpenses.length > page * pageSize;
  const hasPrevPage = page > 1;
  const { start_date, end_date } = expenseData.getDateRange();

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div className="text-left min-w-[150px]">
          <h2 className="font-pixel text-lg text-ink">EXPENSE LIST</h2>
          <p className="font-retro text-[10px] text-ink/70 uppercase">EVERY EXPENSE, IN ONE PLACE</p>
        </div>
        <ExportPdfButton 
          endpoint="/api/reports/export/expense-list/pdf" 
          params={{
            start_date,
            end_date,
            account_id: filters.account_id || undefined,
            category_id: filters.category_id || undefined,
            subcategory_id: filters.subcategory_id || undefined,
            need_or_want: filters.need_or_want || undefined,
          }}
        />
      </div>

      <ExpensePeriodSelector 
        periodType={periodType} setPeriodType={setPeriodType}
        customStartDate={customStartDate} setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate} setCustomEndDate={setCustomEndDate}
        shiftPeriod={shiftPeriod} getPeriodLabel={getPeriodLabel}
        onApplyCustom={() => fetchExpenses(true)}
      />

      <ExpenseFilters 
        filters={filters} setFilters={setFilters}
        categoriesList={categoriesList}
        subcategoriesList={subcategoriesList}
        accountsList={accountsList}
      />

      {loading ? (
        <div className="flex justify-center p-8"><PixelLoader /></div>
      ) : error ? (
        <PixelError message={error} onRetry={() => fetchExpenses(true)} />
      ) : (
        <div className="mt-2">
          
          <div className="mb-4">
            <PixelInput 
              type="text" 
              placeholder="🔍 Search item, description, category..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="py-2 text-sm"
            />
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto border-[3px] border-ink bg-cream shadow-pixel mb-4 w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cyan-light border-b-[3px] border-ink font-pixel text-[8px] text-ink uppercase">
                  <th className="p-3 border-r-[2px] border-ink/20">Date</th>
                  <th className="p-3 border-r-[2px] border-ink/20">Item Name</th>
                  <th className="p-3 border-r-[2px] border-ink/20">Category</th>
                  <th className="p-3 border-r-[2px] border-ink/20">Subcategory</th>
                  <th className="p-3 border-r-[2px] border-ink/20">Need / Want</th>
                  <th className="p-3 border-r-[2px] border-ink/20">Account</th>
                  <th className="p-3 text-right border-r-[2px] border-ink/20">Amount</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="font-retro text-sm text-ink">
                {paginatedExpenses.map((tx, idx) => (
                  <tr key={tx.id} onClick={() => setSelectedTx(tx)} className={`cursor-pointer hover:bg-yellow-pp/20 border-b-[2px] border-ink/10 ${idx % 2 === 0 ? 'bg-cream' : 'bg-black/5'}`}>
                    <td className="p-2 border-r-[2px] border-ink/10 whitespace-nowrap">{formatDatetime(tx.transaction_date).split('•')[0].trim()}</td>
                    <td className="p-2 border-r-[2px] border-ink/10">{tx.item_name || 'Expense'}</td>
                    <td className="p-2 border-r-[2px] border-ink/10">{categoriesMap[tx.category_id] || ''}</td>
                    <td className="p-2 border-r-[2px] border-ink/10">{subcategoriesMap[tx.subcategory_id] || ''}</td>
                    <td className="p-2 border-r-[2px] border-ink/10">
                      {tx.need_or_want && (
                        <span className={`px-2 py-1 text-[10px] uppercase ${tx.need_or_want === 'NEED' ? 'bg-mint' : 'bg-pink-pp'} border-[1px] border-ink`}>{tx.need_or_want}</span>
                      )}
                    </td>
                    <td className="p-2 border-r-[2px] border-ink/10">{accountsMap[tx.account_id] || ''}</td>
                    <td className="p-2 text-right font-pixel text-[10px] border-r-[2px] border-ink/10">₹{Number(tx.amount).toLocaleString('en-IN')}</td>
                    <td className="p-2 text-center" onClick={e => e.stopPropagation()}>
                      {canModifyTransaction(tx) ? (
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => setEditTx(tx)} className="p-1 text-mint hover:text-ink transition-colors">
                            <PixelIcon name="edit" size={16} />
                          </button>
                          <button onClick={() => setDeleteTx(tx)} className="p-1 text-pink-pp hover:text-ink transition-colors">
                            <PixelIcon name="close" size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="font-pixel text-[8px] text-ink/40 uppercase">
                          {tx.bill_id ? 'BILL LINKED' : tx.transaction_type.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedExpenses.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-4 text-center font-pixel text-[10px] text-ink/50">NO MATCHING EXPENSES</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-lavender border-t-[3px] border-ink font-pixel text-xs text-ink">
                <tr>
                  <td colSpan="6" className="p-3 text-right border-r-[2px] border-ink/20">TOTAL</td>
                  <td colSpan="2" className="p-3 text-left">₹{totalExpense.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 md:hidden mb-4">
            {paginatedExpenses.map(tx => (
              <div key={tx.id} onClick={() => setSelectedTx(tx)} className="border-[3px] border-ink bg-cream p-3 shadow-pixel-sm cursor-pointer hover:bg-yellow-pp/10">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-pixel text-[10px] text-ink uppercase truncate max-w-[65%]">{tx.item_name || 'Expense'}</span>
                  <span className="font-pixel text-sm text-pink-pp whitespace-nowrap">-₹{Number(tx.amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="font-retro text-[10px] text-ink/70 flex flex-col gap-0.5">
                  <span className="truncate">{categoriesMap[tx.category_id] || 'Uncategorized'} {tx.subcategory_id && `• ${subcategoriesMap[tx.subcategory_id]}`}</span>
                  <span className="truncate">{tx.need_or_want && `${tx.need_or_want} • `} {accountsMap[tx.account_id] || ''}</span>
                  <span className="mt-1 font-pixel text-[8px] bg-ink/5 inline-block px-1 w-max">{formatDatetime(tx.transaction_date).split('•')[0].trim()}</span>
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
            ))}
            {paginatedExpenses.length === 0 && (
              <div className="text-center font-pixel text-[10px] text-ink/50 p-4 border-[3px] border-ink border-dashed">
                NO MATCHING EXPENSES
              </div>
            )}
            {paginatedExpenses.length > 0 && (
              <div className="border-[3px] border-ink bg-lavender p-2 flex justify-between items-center shadow-pixel-sm mt-2">
                <span className="font-pixel text-[10px] text-ink">TOTAL</span>
                <span className="font-pixel text-sm text-ink">₹{totalExpense.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Pagination */}
          {searchedExpenses.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center bg-cream border-[3px] border-ink p-2 shadow-pixel-sm gap-3 mt-2 w-full box-border">
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <span className="font-pixel text-[10px] text-ink uppercase">ROWS:</span>
                <select 
                  className="bg-cream border-[2px] border-ink p-0.5 font-retro text-xs focus:outline-none focus:bg-cyan-light shadow-pixel-sm cursor-pointer"
                  value={pageSize} 
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-between w-full lg:w-auto gap-2">
                <PixelButton variant="yellow" className="py-1 px-2 text-[8px] sm:text-[10px] shrink-0" disabled={!hasPrevPage} onClick={() => setPage(p => p - 1)}>
                  ← PREV
                </PixelButton>
                <span className="font-pixel text-[8px] text-ink uppercase text-center shrink">
                  SHOWING {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, searchedExpenses.length)} OF {searchedExpenses.length}
                </span>
                <PixelButton variant="cyan" className="py-1 px-2 text-[8px] sm:text-[10px] shrink-0" disabled={!hasNextPage} onClick={() => setPage(p => p + 1)}>
                  NEXT →
                </PixelButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-[100] bg-cream flex flex-col max-w-md mx-auto overflow-y-auto">
          <div className="flex items-center justify-between p-4 bg-yellow-pp border-b-[3px] border-ink sticky top-0 z-10 shadow-pixel-sm">
            <h1 className="font-pixel text-base text-ink uppercase truncate">EXPENSE DETAILS</h1>
            <button onClick={() => setSelectedTx(null)} className="p-1 hover:bg-black/10">
              <PixelIcon name="home" size={24} />
            </button>
          </div>
          
          <div className="p-4 flex flex-col gap-4 pb-24">
            <div className="border-[3px] border-ink bg-pink-pp/20 p-4 shadow-pixel-sm text-center">
              <span className="font-pixel text-xs text-ink/70 block mb-1">{formatDatetime(selectedTx.transaction_date).split('•')[0].trim()}</span>
              <span className="font-pixel text-2xl block mb-2 text-pink-pp">
                ₹{Number(selectedTx.amount).toLocaleString('en-IN')}
              </span>
              <span className="font-pixel text-[10px] px-2 py-1 bg-cream border-[2px] border-ink inline-block">EXPENSE</span>
            </div>

            <PixelCard tape className="flex flex-col gap-3">
              {selectedTx.item_name && (
                <div>
                  <span className="font-pixel text-[8px] text-ink/50 uppercase block">ITEM</span>
                  <span className="font-retro text-sm text-ink">{selectedTx.item_name}</span>
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
                  <span className="font-pixel text-[8px] text-ink/50 uppercase block">NEED / WANT</span>
                  <span className="font-retro text-sm text-ink">{selectedTx.need_or_want}</span>
                </div>
              )}
              {selectedTx.account_id && (
                <div>
                  <span className="font-pixel text-[8px] text-ink/50 uppercase block">ACCOUNT</span>
                  <span className="font-retro text-sm text-ink">{accountsMap[selectedTx.account_id] || selectedTx.account_id}</span>
                </div>
              )}
              {selectedTx.description && (
                <div>
                  <span className="font-pixel text-[8px] text-ink/50 uppercase block">DESCRIPTION</span>
                  <span className="font-retro text-sm text-ink break-words">{selectedTx.description}</span>
                </div>
              )}
            </PixelCard>
            
            <PixelButton variant="yellow" onClick={() => setSelectedTx(null)} className="w-full text-sm mt-2 shadow-pixel-sm">
              CLOSE
            </PixelButton>
          </div>
        </div>
      )}

      <TransactionEditModal
        transaction={editTx}
        isOpen={!!editTx}
        onClose={() => setEditTx(null)}
        onSuccess={() => fetchExpenses(true)}
      />

      <TransactionDeleteModal
        transaction={deleteTx}
        isOpen={!!deleteTx}
        onClose={() => setDeleteTx(null)}
        onSuccess={() => fetchExpenses(true)}
      />
    </div>
  );
}
