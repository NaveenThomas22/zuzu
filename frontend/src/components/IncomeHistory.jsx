import React, { useState } from 'react';
import PixelCard from './PixelCard';
import PixelLoader from './PixelLoader';
import PixelError from './PixelError';
import PixelIcon from './PixelIcon';
import PixelButton from './PixelButton';
import TransactionEditModal from './TransactionEditModal';
import TransactionDeleteModal from './TransactionDeleteModal';
import ExpensePeriodSelector from './ExpensePeriodSelector';
import ExpenseFilters from './ExpenseFilters';
import ExportPdfButton from './ExportPdfButton';
import { canModifyTransaction } from '../utils/transactionUtils';

const IncomeHistory = ({ incomeData, accountsList = [] }) => {
  const { 
    summary, transactions, loading, error, page, setPage, hasMore, fetchIncomeData,
    periodType, setPeriodType, baseDate, setBaseDate, customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate, shiftPeriod, getPeriodLabel, filters, setFilters
  } = incomeData;
  const [editTx, setEditTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchIncomeData(nextPage);
  };

  if (loading && page === 1) {
    return <PixelLoader />;
  }

  if (error && page === 1) {
    return <PixelError message={error} onRetry={() => fetchIncomeData(1)} />;
  }

  const { start_date, end_date } = incomeData.getDateRange();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-4 mt-2">
        <div className="text-left min-w-[150px]">
          <h2 className="font-pixel text-lg text-ink">INCOME HISTORY</h2>
          <p className="font-retro text-[10px] text-ink/70 uppercase">EVERY PENNY YOU'VE EARNED</p>
        </div>
        <ExportPdfButton 
          endpoint="/api/reports/export/income-history/pdf" 
          params={{
            start_date,
            end_date,
            account_id: filters.account_id || undefined,
          }}
        />
      </div>

      <ExpensePeriodSelector 
        periodType={periodType} setPeriodType={setPeriodType}
        customStartDate={customStartDate} setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate} setCustomEndDate={setCustomEndDate}
        shiftPeriod={shiftPeriod} getPeriodLabel={getPeriodLabel}
        onApplyCustom={() => { setPage(1); fetchIncomeData(1, true); }}
      />

      <ExpenseFilters 
        filters={filters} setFilters={setFilters}
        accountsList={accountsList}
        categoriesList={[]}
        subcategoriesList={[]}
      />

      {summary && (
        <div className="grid grid-cols-2 gap-4">
          <PixelCard className="bg-mint">
            <h3 className="font-pixel text-[10px] text-ink/70">TOTAL INCOME</h3>
            <p className="font-retro text-2xl text-ink mt-1">₹{Number(summary.total_income).toLocaleString('en-IN')}</p>
          </PixelCard>
          <PixelCard className="bg-yellow-pp">
            <h3 className="font-pixel text-[10px] text-ink/70">ENTRIES</h3>
            <p className="font-retro text-2xl text-ink mt-1">{summary.income_entries}</p>
          </PixelCard>
        </div>
      )}

      {summary?.monthly_breakdown?.length > 0 && (
        <PixelCard tape>
          <h2 className="font-pixel text-xs text-ink mb-2">MONTHLY INCOME</h2>
          <div className="border-t-[3px] border-ink w-full mb-4"></div>
          <div className="flex flex-col gap-3">
            {summary.monthly_breakdown.map((m, i) => {
              const dateObj = new Date(m.year, m.month - 1);
              const monthName = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
              return (
                <div key={i} className="flex justify-between items-center border-b-[2px] border-ink/20 pb-2">
                  <span className="font-retro text-lg text-ink uppercase">{monthName}</span>
                  <span className="font-pixel text-sm text-mint">₹{Number(m.total).toLocaleString('en-IN')}</span>
                </div>
              );
            })}
          </div>
        </PixelCard>
      )}

      <PixelCard>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-pixel text-xs text-ink">INCOME LIST</h2>
        </div>
        <div className="border-t-[3px] border-ink w-full mb-4"></div>
        
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-ink/50 font-pixel text-xs border-[3px] border-dashed border-ink/30">
            No income entries found.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {transactions.map(txn => (
              <div key={txn.id} className="flex flex-col gap-2 p-3 border-[3px] border-ink bg-cream hover:bg-yellow-pp/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-[2px] border-ink bg-mint flex items-center justify-center shrink-0">
                    <span className="text-xl">💰</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-retro text-lg text-ink truncate">{txn.description || txn.item_name || 'Income'}</p>
                    <p className="font-pixel text-[10px] text-ink/60 mt-1">{new Date(txn.transaction_date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-pixel text-sm text-mint">+₹{Number(txn.amount).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                {canModifyTransaction(txn) ? (
                  <div className="flex gap-2 mt-2 pt-2 border-t-[2px] border-ink/10">
                    <PixelButton variant="cyan" onClick={() => setEditTx(txn)} className="flex-1 py-1 text-[10px]">
                      EDIT
                    </PixelButton>
                    <PixelButton variant="pink" onClick={() => setDeleteTx(txn)} className="flex-1 py-1 text-[10px]">
                      DELETE
                    </PixelButton>
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t-[2px] border-ink/10 text-center">
                    <span className="font-pixel text-[8px] text-ink/40 uppercase">
                      {txn.bill_id ? 'BILL LINKED' : txn.transaction_type.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {hasMore && (
          <button 
            onClick={loadMore}
            disabled={loading}
            className="w-full mt-4 p-3 bg-lavender border-[3px] border-ink font-pixel text-[10px] active:translate-y-1 active:shadow-none shadow-[2px_2px_0_#1A1A1A] transition-all disabled:opacity-50"
          >
            {loading ? 'LOADING...' : 'LOAD MORE'}
          </button>
        )}
      </PixelCard>
      
      <TransactionEditModal
        transaction={editTx}
        isOpen={!!editTx}
        onClose={() => setEditTx(null)}
        onSuccess={() => { setPage(1); fetchIncomeData(1, true); }}
      />

      <TransactionDeleteModal
        transaction={deleteTx}
        isOpen={!!deleteTx}
        onClose={() => setDeleteTx(null)}
        onSuccess={() => { setPage(1); fetchIncomeData(1, true); }}
      />
    </div>
  );
};

export default IncomeHistory;
