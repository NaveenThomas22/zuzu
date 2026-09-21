import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAccounts } from '../api/accounts';
import { getCategories, getCategorySubcategories } from '../api/categories';
import { createTransaction } from '../api/transactions';
import { getErrorMessage } from '../api/client';
import PixelIcon from '../components/PixelIcon';
import PixelButton from '../components/PixelButton';
import PixelInput from '../components/PixelInput';
import PixelCard from '../components/PixelCard';
import BottomNav from '../components/BottomNav';
import PixelError from '../components/PixelError';
import PixelLoader from '../components/PixelLoader';

const TX_TYPES = [
  { value: 'EXPENSE', label: 'Expense', color: 'bg-pink-pp' },
  { value: 'INCOME', label: 'Income', color: 'bg-mint' },
  { value: 'INVESTMENT', label: 'Investment', color: 'bg-lavender' },
  { value: 'REFUND', label: 'Refund', color: 'bg-cyan-light' },
  { value: 'OPENING_BALANCE', label: 'Opening Bal', color: 'bg-yellow-pp' }
];

function getCategoryIcon(category) {
  const icon = category.icon || category.name?.toLowerCase().replace(/\s+/g, '-');
  return icon || 'other';
}

const AddTransactionPage = () => {
  const navigate = useNavigate();
  
  // Data state
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  // Loading & error state
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [transactionType, setTransactionType] = useState('EXPENSE');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [needOrWant, setNeedOrWant] = useState('NEED');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function loadInitial() {
      try {
        const [accRes, catRes] = await Promise.all([
          listAccounts(),
          getCategories()
        ]);
        setAccounts(accRes.data || []);
        setCategories(catRes.data || []);
        
        if (accRes.data?.length > 0) {
          setAccountId(accRes.data[0].id);
        }
      } catch (err) {
        setError(getErrorMessage(err) || "Failed to load initial data.");
      } finally {
        setLoadingInitial(false);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcategoryId('');
      return;
    }
    
    async function loadSubs() {
      setLoadingSubcategories(true);
      try {
        const res = await getCategorySubcategories(categoryId);
        setSubcategories(res.data || []);
      } catch (err) {
        setError(getErrorMessage(err) || "Failed to load subcategories.");
      } finally {
        setLoadingSubcategories(false);
      }
    }
    
    setSubcategoryId('');
    loadSubs();
  }, [categoryId]);

  const handleSave = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        transaction_type: transactionType,
        transaction_date: date,
        amount: Number(amount)
      };

      if (accountId) payload.account_id = accountId;
      if (categoryId) payload.category_id = categoryId;
      if (subcategoryId) payload.subcategory_id = subcategoryId;
      if (itemName) payload.item_name = itemName;
      if (description) payload.description = description;
      if (transactionType === 'EXPENSE' && needOrWant) payload.need_or_want = needOrWant;

      await createTransaction(payload);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to save transaction.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) return <main className="max-w-md mx-auto min-h-screen bg-cream"><PixelLoader /></main>;

  return (
    <main className="max-w-md mx-auto min-h-screen bg-cream pb-24">
      <div className="flex items-center p-4 bg-cyan-light border-b-[3px] border-ink">
        <button onClick={() => navigate(-1)} className="mr-4">
          <PixelIcon name="home" size={24} />
        </button>
        <h1 className="font-pixel text-base text-ink uppercase">Add Transaction</h1>
      </div>

      <div className="p-4 flex flex-col gap-6 mt-2">
        {error && <PixelError message={error} onRetry={() => setError(null)} />}

        {/* Transaction Type Toggle */}
        <div className="flex border-[3px] border-ink shadow-pixel-sm p-1 bg-cream overflow-x-auto gap-1 hide-scrollbar">
          {TX_TYPES.map(t => (
            <button 
              key={t.value}
              className={`shrink-0 font-pixel text-[10px] py-3 px-3 uppercase border-[3px] border-transparent transition-transform ${transactionType === t.value ? `${t.color} border-ink shadow-pixel-sm translate-y-[-2px]` : 'bg-transparent text-ink/70 hover:bg-black/5'}`}
              onClick={() => setTransactionType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <PixelCard tape>
          <div className="relative">
            <PixelInput 
              label="AMOUNT" 
              type="number" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-2xl"
              min="0"
              step="0.01"
            />
            <div className="absolute right-4 top-10 pointer-events-none opacity-50">
              <PixelIcon name="rupee" size={24} />
            </div>
          </div>
        </PixelCard>

        {/* Account Selector */}
        <div>
          <label className="font-pixel text-xs text-ink mb-2 block">ACCOUNT</label>
          <PixelCard className="p-0 overflow-hidden">
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full bg-cream border-none px-3 py-3 font-retro text-base text-ink focus:outline-none focus:bg-cyan-light appearance-none cursor-pointer"
            >
              <option value="">Select Account (Optional)</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </PixelCard>
        </div>

        {/* Need / Want Toggle (Expense Only) */}
        {transactionType === 'EXPENSE' && (
          <div>
            <label className="font-pixel text-xs text-ink mb-2 block">NATURE</label>
            <div className="flex border-[3px] border-ink shadow-pixel-sm p-1 bg-cream gap-1">
              <button 
                className={`flex-1 font-pixel text-[10px] py-2 uppercase border-[3px] border-transparent ${needOrWant === 'NEED' ? 'bg-cyan-light border-ink shadow-pixel-sm' : 'bg-transparent text-ink/70'}`}
                onClick={() => setNeedOrWant('NEED')}
              >
                Need
              </button>
              <button 
                className={`flex-1 font-pixel text-[10px] py-2 uppercase border-[3px] border-transparent ${needOrWant === 'WANT' ? 'bg-pink-pp border-ink shadow-pixel-sm' : 'bg-transparent text-ink/70'}`}
                onClick={() => setNeedOrWant('WANT')}
              >
                Want
              </button>
            </div>
          </div>
        )}

        {/* Item Name */}
        <PixelInput 
          label="ITEM NAME" 
          type="text" 
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          placeholder="E.g., Morning Coffee"
        />

        {/* Categories */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="font-pixel text-xs text-ink">CATEGORY</label>
            <button 
              className="font-retro text-xs text-ink/60 hover:text-ink hover:underline"
              onClick={() => setCategoryId('')}
            >
              CLEAR
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(c => {
              const iconName = getCategoryIcon(c);
              const isSelected = categoryId === c.id;
              return (
                <button 
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`flex flex-col items-center justify-center p-3 gap-2 border-[3px] border-ink shadow-pixel ${isSelected ? 'bg-yellow-pp translate-y-[2px] shadow-none' : 'bg-cream hover:bg-cyan-light'}`}
                >
                  <PixelIcon name={iconName} size={24} accent={isSelected ? '#1A1A1A' : '#4DD0E1'} />
                  <span className="font-pixel text-[8px] uppercase text-center break-words line-clamp-1 w-full">{c.name}</span>
                </button>
              );
            })}
            {categories.length === 0 && (
              <p className="font-retro text-sm text-ink/60 col-span-3 text-center py-4 border-[3px] border-ink border-dashed">
                No categories found.
              </p>
            )}
          </div>
        </div>

        {/* Subcategories */}
        {categoryId && (
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="font-pixel text-xs text-ink">SUBCATEGORY</label>
              {loadingSubcategories && <span className="font-pixel text-[8px] text-ink animate-pulse">LOADING...</span>}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {subcategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSubcategoryId(sub.id)}
                  className={`font-pixel text-[10px] px-3 py-2 border-[3px] border-ink uppercase ${subcategoryId === sub.id ? 'bg-mint shadow-none translate-y-[2px]' : 'bg-cream shadow-pixel hover:bg-cyan-light'}`}
                >
                  {sub.name}
                </button>
              ))}
              {!loadingSubcategories && subcategories.length === 0 && (
                <span className="font-retro text-sm text-ink/60">No subcategories</span>
              )}
            </div>
          </div>
        )}

        {/* Date */}
        <PixelCard>
          <PixelInput 
            label="DATE" 
            type="date" 
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </PixelCard>

        {/* Description / Note */}
        <PixelCard>
          <div className="flex flex-col gap-2">
            <label className="font-pixel text-xs text-ink">DESCRIPTION</label>
            <textarea 
              className="w-full border-[3px] border-ink bg-cream px-3 py-2 font-retro text-lg focus:outline-none focus:bg-cyan-light shadow-pixel-sm min-h-[100px]"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What was this for?"
            />
          </div>
        </PixelCard>

        <PixelButton 
          variant={transactionType === 'EXPENSE' ? 'pink' : 'mint'} 
          className="w-full text-lg mt-4"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "SAVING..." : "✓ SAVE TRANSACTION"}
        </PixelButton>

      </div>
      <BottomNav />
    </main>
  );
};

export default AddTransactionPage;
