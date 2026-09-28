import React from 'react';
import PixelCard from './PixelCard';
import PixelLoader from './PixelLoader';
import PixelError from './PixelError';
import EmptyState from './EmptyState';
import ExpensePeriodSelector from './ExpensePeriodSelector';
import ExpenseFilters from './ExpenseFilters';
import ExportPdfButton from './ExportPdfButton';

const PieSlice = ({ startAngle, endAngle, color, radius }) => {
  const x1 = 50 + radius * Math.cos(Math.PI * startAngle / 180);
  const y1 = 50 + radius * Math.sin(Math.PI * startAngle / 180);
  const x2 = 50 + radius * Math.cos(Math.PI * endAngle / 180);
  const y2 = 50 + radius * Math.sin(Math.PI * endAngle / 180);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  const d = `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  return <path d={d} fill={color} stroke="#1A1A1A" strokeWidth="2" shapeRendering="crispEdges" />;
};

export default function ExpenseAnalysis({ expenseData }) {
  const {
    loading, error,
    periodType, setPeriodType,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate,
    shiftPeriod, getPeriodLabel,
    fetchExpenses,
    filters, setFilters,
    categoriesList, subcategoriesList, accountsList,
    filteredExpenses, summaryData
  } = expenseData;

  const { totalExpense, totalNeeds, totalWants, categoryData } = summaryData || { totalExpense: 0, totalNeeds: 0, totalWants: 0, categoryData: [] };
  const pieColors = ['#F48FB1', '#4DD0E1', '#FFF176', '#A5D6A7', '#CE93D8', '#FFB74D'];
  const { start_date, end_date } = expenseData.getDateRange();

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div className="text-left min-w-[150px]">
          <h2 className="font-pixel text-lg text-ink">EXPENSE ANALYSIS</h2>
          <p className="font-retro text-[10px] text-ink/70 uppercase">KNOW YOUR MONEY</p>
        </div>
        <ExportPdfButton 
          endpoint="/api/reports/export/expense-analysis/pdf" 
          params={{ start_date, end_date }} 
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
      ) : filteredExpenses.length === 0 ? (
        <EmptyState title="NO EXPENSES FOUND" message="Try another date range or remove some filters." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <PixelCard className="text-center bg-yellow-pp flex flex-col justify-center items-center py-4 !p-2">
              <span className="font-pixel text-[10px] text-ink/70">TOTAL EXPENSE</span>
              <span className="font-pixel text-xl text-ink">₹{totalExpense.toLocaleString('en-IN')}</span>
            </PixelCard>
            <div className="flex flex-col gap-3">
              <div className="border-[3px] border-ink bg-mint p-2 shadow-pixel-sm text-center flex flex-col justify-center">
                <span className="font-pixel text-[8px] text-ink/70">NEEDS</span>
                <span className="font-pixel text-sm text-ink block">₹{totalNeeds.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-[3px] border-ink bg-pink-pp p-2 shadow-pixel-sm text-center flex flex-col justify-center">
                <span className="font-pixel text-[8px] text-ink/70">WANTS</span>
                <span className="font-pixel text-sm text-ink block">₹{totalWants.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="border-[3px] border-ink bg-lavender p-2 shadow-pixel-sm text-center flex flex-col items-center">
            <span className="font-pixel text-[10px] text-ink/70 uppercase">TRANSACTIONS MATCHING</span>
            <span className="font-pixel text-lg text-ink block mt-1">{filteredExpenses.length}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full">
            <PixelCard tape className="flex-1">
              <h2 className="font-pixel text-xs text-ink mb-2">EXPENSE BY CATEGORY</h2>
              <div className="border-t-[3px] border-ink w-full mb-4"></div>
              {categoryData.length > 0 ? (
                <div className="flex flex-col items-center gap-6 mt-4">
                  <svg viewBox="0 0 100 100" className="w-40 h-40 drop-shadow-[4px_4px_0_#1A1A1A]">
                    {(() => {
                      let currentAngle = 0;
                      const totalCat = categoryData.reduce((sum, e) => sum + e.val, 0);
                      return categoryData.map((entry, i) => {
                        const angle = (entry.val / totalCat) * 360;
                        const slice = <PieSlice key={entry.name + i} startAngle={currentAngle} endAngle={currentAngle + angle} color={pieColors[i % pieColors.length]} radius={45} />;
                        currentAngle += angle;
                        return slice;
                      });
                    })()}
                  </svg>
                  <div className="w-full flex flex-col gap-2 mt-2">
                    {categoryData.map((entry, i) => (
                      <div key={entry.name + i} className="flex items-center justify-between font-retro text-sm text-ink">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-ink" style={{ backgroundColor: pieColors[i % pieColors.length] }}></div>
                          <span className="truncate max-w-[120px]">{entry.name}</span>
                        </div>
                        <span className="font-pixel text-[8px]">₹{entry.val.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="font-pixel text-[10px] text-center text-ink/50">NO CATEGORY DATA</p>
              )}
            </PixelCard>

            <PixelCard className="flex-1">
              <h2 className="font-pixel text-xs text-ink mb-2">NEED VS WANT</h2>
              <div className="border-t-[3px] border-ink w-full mb-4"></div>
              {totalExpense > 0 ? (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex h-8 border-[3px] border-ink shadow-pixel-sm overflow-hidden w-full">
                    <div className="bg-mint h-full flex items-center justify-center font-pixel text-[10px] text-ink" style={{ width: `${(totalNeeds/totalExpense)*100}%` }}>
                      {totalNeeds > 0 && `${((totalNeeds/totalExpense)*100).toFixed(0)}%`}
                    </div>
                    <div className="bg-pink-pp h-full flex items-center justify-center font-pixel text-[10px] text-ink" style={{ width: `${(totalWants/totalExpense)*100}%` }}>
                      {totalWants > 0 && `${((totalWants/totalExpense)*100).toFixed(0)}%`}
                    </div>
                  </div>
                  <div className="flex justify-between px-2">
                    <div className="flex flex-col text-left">
                      <span className="font-pixel text-[10px] text-ink">NEED</span>
                      <span className="font-retro text-sm text-ink">₹{totalNeeds.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="font-pixel text-[10px] text-ink">WANT</span>
                      <span className="font-retro text-sm text-ink">₹{totalWants.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="font-pixel text-[10px] text-center text-ink/50">NO DATA</p>
              )}
            </PixelCard>
          </div>
        </>
      )}
    </div>
  );
}
