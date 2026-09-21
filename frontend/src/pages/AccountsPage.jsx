import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAccounts, createAccount, updateAccount, deleteAccount } from '../api/accounts';
import { getErrorMessage } from '../api/client';
import PixelIcon from '../components/PixelIcon';
import PixelCard from '../components/PixelCard';
import PixelButton from '../components/PixelButton';
import PixelInput from '../components/PixelInput';
import EmptyState from '../components/EmptyState';
import PixelLoader from '../components/PixelLoader';
import PixelError from '../components/PixelError';

const ACCOUNT_TYPES = ['CASH', 'BANK', 'UPI', 'CREDIT_CARD', 'WALLET', 'OTHER'];

const getTypeIcon = (type) => {
  switch (type) {
    case 'CASH': return 'money-stack';
    case 'BANK': return 'computer';
    case 'UPI': return 'profile';
    case 'CREDIT_CARD': return 'reports';
    case 'WALLET': return 'book';
    default: return 'sun';
  }
};

const AccountsPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Overlay state
  const [showOverlay, setShowOverlay] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({ name: '', account_type: 'BANK', is_active: true });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAccounts();
      setAccounts(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openAdd = () => {
    setFormData({ name: '', account_type: 'BANK', is_active: true });
    setIsEditing(false);
    setEditId(null);
    setFormError(null);
    setShowOverlay(true);
  };

  const openEdit = (account) => {
    setFormData({ name: account.name, account_type: account.account_type, is_active: account.is_active });
    setIsEditing(true);
    setEditId(account.id);
    setFormError(null);
    setShowOverlay(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.name.trim() || formData.name.length > 100) {
      setFormError("Please enter a valid name (1-100 characters).");
      return;
    }
    
    setSubmitting(true);
    setFormError(null);
    try {
      if (isEditing) {
        await updateAccount(editId, {
          name: formData.name.trim(),
          account_type: formData.account_type,
          is_active: formData.is_active
        });
      } else {
        await createAccount({
          name: formData.name.trim(),
          account_type: formData.account_type
        });
      }
      setShowOverlay(false);
      await fetchAccounts();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setFormError("YOU ALREADY HAVE AN ACCOUNT WITH THIS NAME.");
      } else {
        setFormError(getErrorMessage(err) || "Failed to save account.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (accountId) => {
    setSubmitting(true);
    setError(null);
    try {
      await deleteAccount(accountId);
      setDeleteConfirmId(null);
      await fetchAccounts();
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to delete account.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <main className="max-w-md mx-auto min-h-screen bg-cream flex flex-col items-center justify-center">
      <p className="font-pixel text-ink mb-4 text-center uppercase">Loading your money spots...</p>
      <PixelLoader />
    </main>
  );

  return (
    <main className="max-w-md mx-auto min-h-screen bg-cream pb-24 relative overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center p-4 bg-cyan-light border-b-[3px] border-ink relative z-10 sticky top-0">
        <button onClick={() => navigate('/profile')} className="mr-4">
          <PixelIcon name="arrow-left" size={24} />
        </button>
        <div className="flex flex-col">
          <h1 className="font-pixel text-base text-ink uppercase">MY ACCOUNTS</h1>
          <p className="font-retro text-xs text-ink/80 italic">Where your money lives.</p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 relative z-10">
        {error && <PixelError message={error} onRetry={fetchAccounts} />}

        {accounts.length === 0 ? (
          <EmptyState 
            title="WHERE DOES YOUR MONEY LIVE?" 
            message="Add your first account to start tracking."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="border-[3px] border-ink bg-cream shadow-pixel-sm overflow-hidden flex flex-col">
                <div className="flex items-start gap-3 p-3">
                  <div className={`w-12 h-12 border-[3px] border-ink flex items-center justify-center shrink-0 ${acc.is_active ? 'bg-yellow-pp' : 'bg-cream opacity-50'}`}>
                    <PixelIcon name={getTypeIcon(acc.account_type)} size={28} />
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <h3 className={`font-pixel text-sm text-ink truncate break-words whitespace-normal ${!acc.is_active && 'text-ink/60'}`}>{acc.name}</h3>
                    <p className="font-retro text-xs text-ink/70 mt-1 uppercase">{acc.account_type}</p>
                    {!acc.is_active && (
                      <span className="inline-block mt-1 bg-cream border-[2px] border-ink font-pixel text-[8px] px-1 py-0.5 text-ink/70">
                        INACTIVE
                      </span>
                    )}
                  </div>
                </div>
                
                {deleteConfirmId === acc.id ? (
                  <div className="border-t-[3px] border-ink border-dashed p-3 bg-pink-pp/10 flex flex-col gap-2">
                    <p className="font-pixel text-[10px] text-ink uppercase text-center">DELETE THIS ACCOUNT?</p>
                    <p className="font-retro text-xs text-ink text-center mb-1">"{acc.name}" will no longer appear in your accounts.</p>
                    <div className="flex gap-2">
                      <PixelButton variant="yellow" className="flex-1 text-xs" onClick={() => setDeleteConfirmId(null)} disabled={submitting}>CANCEL</PixelButton>
                      <PixelButton variant="pink" className="flex-1 text-xs" onClick={() => handleDelete(acc.id)} disabled={submitting}>
                        {submitting ? '...' : 'DELETE'}
                      </PixelButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex border-t-[3px] border-ink bg-cyan-light/20">
                    <button 
                      className="flex-1 py-2 font-pixel text-[10px] text-ink border-r-[3px] border-ink hover:bg-cyan-light"
                      onClick={() => openEdit(acc)}
                    >
                      EDIT
                    </button>
                    <button 
                      className="flex-1 py-2 font-pixel text-[10px] text-pink-pp hover:bg-pink-pp hover:text-ink transition-colors"
                      onClick={() => setDeleteConfirmId(acc.id)}
                    >
                      DELETE
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 z-40 bg-gradient-to-t from-cream via-cream to-transparent pointer-events-none">
        <PixelButton 
          variant="pink" 
          className="w-full text-lg pointer-events-auto shadow-pixel-sm mb-4" 
          onClick={openAdd}
        >
          + ADD ACCOUNT
        </PixelButton>
      </div>

      {/* Add / Edit Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 bg-cream flex flex-col max-w-md mx-auto overflow-y-auto">
          <div className="flex items-center p-4 bg-yellow-pp border-b-[3px] border-ink sticky top-0 z-10">
            <button onClick={() => setShowOverlay(false)} className="mr-4" disabled={submitting}>
              <PixelIcon name="arrow-left" size={24} />
            </button>
            <h1 className="font-pixel text-base text-ink uppercase">{isEditing ? 'EDIT ACCOUNT' : 'NEW ACCOUNT'}</h1>
          </div>
          
          <div className="p-4 flex flex-col gap-5 pb-24">
            {formError && <PixelError message={formError} onRetry={() => setFormError(null)} />}
            
            <PixelInput 
              label="ACCOUNT NAME" 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="E.g., HDFC Bank"
              disabled={submitting}
            />
            
            <div>
              <label className="font-pixel text-xs text-ink mb-2 block">ACCOUNT TYPE</label>
              <PixelCard className="p-0 overflow-hidden" tape>
                <select
                  value={formData.account_type}
                  onChange={e => setFormData({...formData, account_type: e.target.value})}
                  className="w-full bg-cream border-none px-3 py-3 font-retro text-base text-ink focus:outline-none focus:bg-cyan-light appearance-none cursor-pointer"
                  disabled={submitting}
                >
                  {ACCOUNT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </PixelCard>
            </div>
            
            {isEditing && (
              <div>
                <label className="font-pixel text-xs text-ink mb-2 block">STATUS</label>
                <div className="flex border-[3px] border-ink shadow-pixel-sm p-1 bg-cream gap-1">
                  <button 
                    className={`flex-1 font-pixel text-[10px] py-2 uppercase border-[3px] border-transparent ${formData.is_active ? 'bg-mint border-ink shadow-pixel-sm' : 'bg-transparent text-ink/70'}`}
                    onClick={() => setFormData({...formData, is_active: true})}
                    disabled={submitting}
                  >
                    ACTIVE
                  </button>
                  <button 
                    className={`flex-1 font-pixel text-[10px] py-2 uppercase border-[3px] border-transparent ${!formData.is_active ? 'bg-pink-pp border-ink shadow-pixel-sm' : 'bg-transparent text-ink/70'}`}
                    onClick={() => setFormData({...formData, is_active: false})}
                    disabled={submitting}
                  >
                    INACTIVE
                  </button>
                </div>
              </div>
            )}
            
            <PixelButton 
              variant="mint" 
              onClick={handleFormSubmit}
              disabled={submitting}
              className="w-full text-lg mt-4"
            >
              {submitting ? 'SAVING...' : isEditing ? '✓ SAVE CHANGES' : '✓ CREATE ACCOUNT'}
            </PixelButton>
          </div>
        </div>
      )}
    </main>
  );
};

export default AccountsPage;
