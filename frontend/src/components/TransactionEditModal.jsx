import React, { useState, useEffect } from 'react';
import { updateTransaction } from '../api/transactions';
import { listAccounts } from '../api/accounts';
import { getCategories, getCategorySubcategories } from '../api/categories';
import PixelButton from './PixelButton';
import PixelInput from './PixelInput';
import PixelCard from './PixelCard';
import PixelIcon from './PixelIcon';
import PixelError from './PixelError';
import CategorySelector from './CategorySelector';

function getCategoryIcon(category) {
  const icon = category.icon || category.name?.toLowerCase().replace(/\s+/g, '-');
  return icon || 'other';
}

export default function TransactionEditModal({ transaction, isOpen, onClose, onSuccess }) {
  // Data state
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [needOrWant, setNeedOrWant] = useState('NEED');
  const [date, setDate] = useState('');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');

  // Setup form when transaction opens
  useEffect(() => {
    if (!isOpen || !transaction) return;
    
    setAmount(transaction.amount || '');
    setAccountId(transaction.account_id || '');
    setCategoryId(transaction.category_id || '');
    setSubcategoryId(transaction.subcategory_id || '');
    setNeedOrWant(transaction.need_or_want || 'NEED');
    setDate(transaction.transaction_date || '');
    setItemName(transaction.item_name || '');
    setDescription(transaction.description || '');
    setError(null);
  }, [isOpen, transaction]);

  // Load Base Lookups
  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;
    async function loadLookups() {
      setLoadingLookups(true);
      try {
        const [accRes, catRes] = await Promise.all([listAccounts(), getCategories()]);
        const acts = accRes.data || [];
        const cats = catRes.data || [];
        if (!isMounted) return;
        setAccounts(acts);
        setCategories(cats);
      } catch (err) {
        setError('Failed to load form lookups.');
      } finally {
        if (isMounted) setLoadingLookups(false);
      }
    }
    loadLookups();
    return () => { isMounted = false; };
  }, [isOpen]);

  // Load Subcategories when Category changes
  useEffect(() => {
    if (!isOpen || !categoryId) {
      setSubcategories([]);
      return;
    }
    
    let isMounted = true;
    async function loadSubs() {
      setLoadingSubcategories(true);
      try {
        const res = await getCategorySubcategories(categoryId);
        if (!isMounted) return;
        const subs = res.data || [];
        setSubcategories(subs);
        
        // Reset subcategory if it doesn't belong to the newly selected category
        const isValidSub = subs.find(s => s.id === subcategoryId);
        if (!isValidSub && subcategoryId !== '') {
          setSubcategoryId('');
        }
      } catch (err) {
        setError('Failed to load subcategories.');
        if (isMounted) setSubcategories([]);
      } finally {
        if (isMounted) setLoadingSubcategories(false);
      }
    }
    
    loadSubs();
    return () => { isMounted = false; };
  }, [categoryId, isOpen]); // Note: subcategoryId is omitted intentionally to avoid loops

  const handleSave = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
      const payload = {
        amount: Number(amount),
        transaction_date: date,
        account_id: accountId || null,
        description: description || null
      };

      const txType = transaction.transaction_type;
      const showExtraFields = txType !== 'INCOME' && txType !== 'INVESTMENT' && txType !== 'OPENING_BALANCE';
      
      if (showExtraFields) {
        payload.category_id = categoryId || null;
        payload.subcategory_id = subcategoryId || null;
        payload.item_name = itemName || null;
        if (txType === 'EXPENSE' && needOrWant) {
          payload.need_or_want = needOrWant;
        }
      } else {
        payload.category_id = null;
        payload.subcategory_id = null;
        payload.item_name = null;
        payload.need_or_want = null;
      }

      await updateTransaction(transaction.id, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update transaction");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !transaction) return null;

  const txType = transaction.transaction_type;
  const showExtraFields = txType !== 'INCOME' && txType !== 'INVESTMENT' && txType !== 'OPENING_BALANCE';

  return (
    <div className="fixed inset-0 z-[200] bg-cream/90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-cream border-[3px] border-ink shadow-pixel flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-yellow-pp border-b-[3px] border-ink shrink-0">
          <h2 className="font-pixel text-base text-ink uppercase truncate">EDIT {txType.replace('_', ' ')}</h2>
          <button onClick={onClose} disabled={saving} className="p-1 hover:bg-black/10">
            <PixelIcon name="home" size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 flex flex-col gap-6 overflow-y-auto">
          {error && <PixelError message={error} onRetry={() => setError(null)} />}
          
          {loadingLookups && (
             <span className="font-pixel text-[8px] text-ink animate-pulse text-center">LOADING DATA...</span>
          )}

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
          {txType === 'EXPENSE' && (
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
          {showExtraFields && (
            <PixelInput 
              label="ITEM NAME" 
              type="text" 
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="E.g., Morning Coffee"
            />
          )}

          {/* Categories */}
          {showExtraFields && (
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
              <CategorySelector 
                categories={categories} 
                selectedId={categoryId} 
                onSelect={setCategoryId} 
                onClear={() => setCategoryId('')} 
              />
            </div>
          )}

          {/* Subcategories */}
          {showExtraFields && categoryId && (
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
                className="w-full border-[3px] border-ink bg-cream px-3 py-2 font-retro text-lg focus:outline-none focus:bg-cyan-light shadow-pixel-sm min-h-[80px]"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What was this for?"
              />
            </div>
          </PixelCard>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-[3px] border-ink bg-cream shrink-0">
          <PixelButton 
            variant="cyan" 
            className="w-full text-lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "SAVING..." : "✓ SAVE CHANGES"}
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
