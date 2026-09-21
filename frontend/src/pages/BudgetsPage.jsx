import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listBudgets, createBudget, updateBudget, deleteBudget } from '../api/budgets';
import { getCategories } from '../api/categories';
import { getErrorMessage } from '../api/client';
import PixelIcon from '../components/PixelIcon';
import PixelCard from '../components/PixelCard';
import PixelButton from '../components/PixelButton';
import PixelInput from '../components/PixelInput';
import EmptyState from '../components/EmptyState';
import PixelLoader from '../components/PixelLoader';
import PixelError from '../components/PixelError';
import BottomNav from '../components/BottomNav';

const MONTHS = [
  { val: 1, label: 'January' },
  { val: 2, label: 'February' },
  { val: 3, label: 'March' },
  { val: 4, label: 'April' },
  { val: 5, label: 'May' },
  { val: 6, label: 'June' },
  { val: 7, label: 'July' },
  { val: 8, label: 'August' },
  { val: 9, label: 'September' },
  { val: 10, label: 'October' },
  { val: 11, label: 'November' },
  { val: 12, label: 'December' },
];

const BudgetsPage = () => {
  const navigate = useNavigate();
  const today = new Date();
  
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    category_id: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({ 
    category_id: '', 
    year: today.getFullYear(), 
    month: today.getMonth() + 1, 
    amount: '' 
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams = { year: filters.year, month: filters.month };
      if (filters.category_id) {
        apiParams.category_id = filters.category_id;
      }
      
      const [budgetsRes, categoriesRes] = await Promise.all([
        listBudgets(apiParams),
        categories.length === 0 ? getCategories() : Promise.resolve({ data: categories })
      ]);
      
      setBudgets(budgetsRes.data || []);
      if (categories.length === 0) {
        setCategories(categoriesRes.data || []);
      }
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to load budgets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.year, filters.month, filters.category_id]); // Re-fetch on filter change

  const getCategoryIcon = (categoryId, categoryName) => {
    const cat = categories.find(c => c.id === categoryId);
    if (cat && cat.icon) return cat.icon;
    // Fallback based on name keywords if no icon exists
    const name = (cat?.name || categoryName || '').toLowerCase();
    if (name.includes('food')) return 'food';
    if (name.includes('travel')) return 'travel';
    if (name.includes('house') || name.includes('rent')) return 'housing';
    if (name.includes('fit') || name.includes('health')) return 'fitness';
    if (name.includes('care') || name.includes('salon')) return 'self-care';
    if (name.includes('cloth')) return 'clothing';
    if (name.includes('entert')) return 'entertainment';
    return 'reports'; // fallback default
  };

  const getMonthName = (monthNum) => {
    const m = MONTHS.find(m => m.val === parseInt(monthNum));
    return m ? m.label : monthNum;
  };

  const openAdd = () => {
    setFormData({ 
      category_id: categories.length > 0 ? categories[0].id : '', 
      year: filters.year, 
      month: filters.month, 
      amount: '' 
    });
    setIsEditing(false);
    setEditId(null);
    setFormError(null);
    setShowAddModal(true);
  };

  const openEdit = (budget) => {
    setFormData({ 
      category_id: budget.category_id, 
      year: budget.year, 
      month: budget.month, 
      amount: budget.amount 
    });
    setIsEditing(true);
    setEditId(budget.id);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.category_id) {
      setFormError("Please select a category.");
      return;
    }
    const y = parseInt(formData.year);
    if (isNaN(y) || y < 1 || y > 32767) {
      setFormError("Please enter a valid year.");
      return;
    }
    const m = parseInt(formData.month);
    if (isNaN(m) || m < 1 || m > 12) {
      setFormError("Please select a valid month.");
      return;
    }
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Amount must be greater than 0.");
      return;
    }
    
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        category_id: formData.category_id,
        year: y,
        month: m,
        amount: Number(amt).toFixed(2).toString() // stringent decimal string
      };

      if (isEditing) {
        await updateBudget(editId, payload);
      } else {
        await createBudget(payload);
      }
      setShowAddModal(false);
      await fetchData();
    } catch (err) {
      setFormError(getErrorMessage(err) || "Failed to save budget.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (budgetId) => {
    setSubmitting(true);
    setError(null);
    try {
      await deleteBudget(budgetId);
      setDeleteConfirmId(null);
      await fetchData();
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to delete budget.");
    } finally {
      setSubmitting(false);
    }
  };

  // Safe Summaries calculations
  const totalBudget = budgets.reduce((acc, b) => acc + parseFloat(b.amount || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + parseFloat(b.amount_spent || 0), 0);
  const totalRemaining = budgets.reduce((acc, b) => acc + parseFloat(b.remaining_amount || 0), 0);

  // Generate Year Options
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  return (
    <main className="max-w-md mx-auto min-h-screen bg-cream pb-32 relative overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-cyan-light border-b-[3px] border-ink relative z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <PixelIcon name="arrow-left" size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="font-pixel text-base text-ink uppercase">BUDGETS</h1>
            <p className="font-retro text-[10px] text-ink/80 italic">Don't overspend your hard-earned money.</p>
          </div>
        </div>
        <PixelIcon name="chart" size={24} />
      </div>

      <div className="p-4 flex flex-col gap-4 relative z-10">
        {error && <PixelError message={error} onRetry={fetchData} />}

        {/* Quick Month Filter & Summary Toggle */}
        <div className="flex flex-col border-[3px] border-ink shadow-pixel-sm bg-lavender p-3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-pixel text-xs text-ink uppercase">SUMMARY ({getMonthName(filters.month)} {filters.year})</h2>
            <button 
              className="font-retro text-xs text-ink underline"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'HIDE FILTERS' : 'CHANGE MONTH'}
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 border-t-[3px] border-ink border-dashed pt-2">
            <div className="flex flex-col justify-center text-center">
              <span className="font-pixel text-[8px] uppercase">Budget</span>
              <span className="font-retro text-sm mt-1">₹{totalBudget.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex flex-col justify-center text-center">
              <span className="font-pixel text-[8px] uppercase">Spent</span>
              <span className="font-retro text-sm mt-1 text-pink-pp">₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex flex-col justify-center text-center">
              <span className="font-pixel text-[8px] uppercase">Remaining</span>
              <span className={`font-retro text-sm mt-1 ${totalRemaining < 0 ? 'text-pink-pp font-bold' : 'text-mint'}`}>
                {totalRemaining < 0 ? '-' : ''}₹{Math.abs(totalRemaining).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-[3px] border-ink bg-yellow-pp p-3 shadow-pixel-sm flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">YEAR</label>
                <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none"
                  value={filters.year} onChange={e => setFilters({...filters, year: parseInt(e.target.value)})}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">MONTH</label>
                <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none"
                  value={filters.month} onChange={e => setFilters({...filters, month: parseInt(e.target.value)})}>
                  {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="font-pixel text-[8px] text-ink block mb-1">CATEGORY (OPTIONAL)</label>
                <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none"
                  value={filters.category_id} onChange={e => setFilters({...filters, category_id: e.target.value})}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
           <div className="flex justify-center p-8"><PixelLoader /></div>
        ) : budgets.length === 0 ? (
          <EmptyState 
            title="NO BUDGETS YET!" 
            message="Set a spending limit before your money disappears."
            ctaLabel="+ Add Budget"
            onCtaClick={openAdd}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {budgets.map(budget => {
              const rem = parseFloat(budget.remaining_amount);
              const isOver = rem < 0;
              const pctUsed = parseFloat(budget.percentage_used);
              const visualPct = pctUsed > 100 ? 100 : pctUsed; // visually capped
              
              return (
                <div key={budget.id} className={`border-[3px] border-ink shadow-pixel-sm overflow-hidden flex flex-col ${isOver ? 'bg-pink-pp/10' : 'bg-cream'}`}>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 max-w-[65%]">
                        <div className="p-1 border-[2px] border-ink bg-cyan-light">
                          <PixelIcon name={getCategoryIcon(budget.category_id, budget.category_name)} size={16} />
                        </div>
                        <h3 className="font-pixel text-sm text-ink truncate" title={budget.category_name}>{budget.category_name}</h3>
                      </div>
                      <span className="font-pixel text-[8px] px-1.5 py-1 text-ink border-[2px] border-ink bg-cream">
                        {getMonthName(budget.month).substring(0, 3).toUpperCase()} {budget.year}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-1 gap-x-2 font-retro text-xs text-ink/90 mb-3">
                      <div>Budget: <span className="font-bold">₹{Number(budget.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></div>
                      <div className="text-right">Spent: <span className="font-bold">₹{Number(budget.amount_spent).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></div>
                      <div>Remaining: <span className={`font-bold ${isOver ? 'text-pink-pp' : ''}`}>{isOver ? '-' : ''}₹{Math.abs(rem).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 border-[2px] border-ink bg-cream relative flex items-center">
                        <div 
                          className={`absolute top-0 left-0 bottom-0 transition-all duration-500 ${isOver ? 'bg-pink-pp' : 'bg-mint'}`}
                          style={{ width: `${visualPct}%` }}
                        ></div>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] pointer-events-none opacity-50"></div>
                      </div>
                      <span className="font-pixel text-[8px] text-ink w-10 text-right">{pctUsed.toFixed(2)}%</span>
                    </div>

                    {isOver && (
                      <div className="mt-2 text-center bg-pink-pp border-[2px] border-ink text-ink font-pixel text-[10px] py-1 shadow-[2px_2px_0_#1A1A1A]">
                        OVER BUDGET! ₹{Math.abs(rem).toLocaleString('en-IN', { maximumFractionDigits: 2 })} over
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex gap-2 mt-3 pt-3 border-t-[3px] border-ink border-dashed">
                      <PixelButton variant="yellow" className="flex-1 py-1 text-[10px]" onClick={() => openEdit(budget)}>EDIT</PixelButton>
                      {!deleteConfirmId && (
                        <button className="px-2 font-pixel text-[8px] border-[2px] border-ink text-pink-pp hover:bg-pink-pp hover:text-ink transition-colors" onClick={() => setDeleteConfirmId(budget.id)}>DEL</button>
                      )}
                    </div>

                    {/* Delete Confirm Modal Inline */}
                    {deleteConfirmId === budget.id && (
                      <div className="mt-2 p-2 bg-pink-pp/20 border-[2px] border-ink flex flex-col gap-2">
                        <p className="font-pixel text-[10px] text-ink uppercase text-center">DELETE THIS BUDGET?</p>
                        <p className="font-retro text-[10px] text-ink text-center mb-1 leading-tight">Your expense transactions will NOT be deleted.</p>
                        <div className="flex gap-2 mt-1">
                          <PixelButton variant="yellow" className="flex-1 text-xs" onClick={() => setDeleteConfirmId(null)} disabled={submitting}>KEEP</PixelButton>
                          <PixelButton variant="pink" className="flex-1 text-xs" onClick={() => handleDelete(budget.id)} disabled={submitting}>
                            {submitting ? '...' : 'DELETE'}
                          </PixelButton>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 z-40 bg-gradient-to-t from-cream via-cream to-transparent pointer-events-none pb-24">
        <PixelButton 
          variant="cyan" 
          className="w-full text-lg pointer-events-auto shadow-pixel-sm" 
          onClick={openAdd}
        >
          + ADD BUDGET
        </PixelButton>
      </div>

      {/* Add / Edit Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-cream flex flex-col max-w-md mx-auto overflow-y-auto">
          <div className="flex items-center p-4 bg-cyan-light border-b-[3px] border-ink sticky top-0 z-10">
            <button onClick={() => setShowAddModal(false)} className="mr-4" disabled={submitting}>
              <PixelIcon name="arrow-left" size={24} />
            </button>
            <h1 className="font-pixel text-base text-ink uppercase">{isEditing ? 'EDIT BUDGET' : 'ADD BUDGET'}</h1>
          </div>
          
          <div className="p-4 flex flex-col gap-5 pb-24">
            {formError && <PixelError message={formError} onRetry={() => setFormError(null)} />}
            
            <div>
              <label className="font-pixel text-xs text-ink mb-2 block">CATEGORY</label>
              <PixelCard className="p-0 overflow-hidden" tape>
                <select
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                  className="w-full bg-cream border-none px-2 py-3 font-retro text-sm text-ink focus:outline-none appearance-none cursor-pointer"
                  disabled={submitting}
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </PixelCard>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-pixel text-xs text-ink mb-2 block">YEAR</label>
                <PixelCard className="p-0 overflow-hidden" tape>
                  <select
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: e.target.value})}
                    className="w-full bg-cream border-none px-2 py-3 font-retro text-sm text-ink focus:outline-none appearance-none cursor-pointer"
                    disabled={submitting}
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </PixelCard>
              </div>

              <div>
                <label className="font-pixel text-xs text-ink mb-2 block">MONTH</label>
                <PixelCard className="p-0 overflow-hidden" tape>
                  <select
                    value={formData.month}
                    onChange={e => setFormData({...formData, month: e.target.value})}
                    className="w-full bg-cream border-none px-2 py-3 font-retro text-sm text-ink focus:outline-none appearance-none cursor-pointer"
                    disabled={submitting}
                  >
                    {MONTHS.map(m => (
                      <option key={m.val} value={m.val}>{m.label}</option>
                    ))}
                  </select>
                </PixelCard>
              </div>
            </div>

            <PixelCard tape>
              <div className="relative">
                <PixelInput 
                  label="BUDGET AMOUNT" 
                  type="number" 
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  className="text-xl"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
                <div className="absolute right-4 top-10 pointer-events-none opacity-50">
                  <PixelIcon name="rupee" size={24} />
                </div>
              </div>
            </PixelCard>
            
            <PixelButton 
              variant="mint" 
              onClick={handleFormSubmit}
              disabled={submitting}
              className="w-full text-lg mt-4"
            >
              {submitting ? 'SAVING...' : isEditing ? '✓ SAVE BUDGET' : '✓ CREATE BUDGET'}
            </PixelButton>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
};

export default BudgetsPage;
