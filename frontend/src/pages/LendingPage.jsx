import React, { useState, useEffect } from 'react';
import { listLendings, createLending, createRepayment } from '../api/lendings';
import { getAnalytics } from '../api/analytics';
import { getErrorMessage } from '../api/client';
import PixelIcon from '../components/PixelIcon';
import PixelCard from '../components/PixelCard';
import PixelButton from '../components/PixelButton';
import PixelInput from '../components/PixelInput';
import EmptyState from '../components/EmptyState';
import PixelLoader from '../components/PixelLoader';
import PixelError from '../components/PixelError';
import BottomNav from '../components/BottomNav';

const LendingPage = () => {
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [lendings, setLendings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [repayLendingId, setRepayLendingId] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({ person_name: '', total_amount: '', lending_date: new Date().toISOString().split('T')[0], note: '' });
  const [repayForm, setRepayForm] = useState({ amount: '', repayment_date: new Date().toISOString().split('T')[0], note: '' });
  
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lendRes, statRes] = await Promise.all([
        listLendings(),
        getAnalytics()
      ]);
      setLendings(lendRes.data || []);
      setAnalytics(statRes.data || null);
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to load lending records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async () => {
    const amount = Number(addForm.total_amount);
    if (!addForm.person_name.trim() || isNaN(amount) || amount <= 0 || !addForm.lending_date) {
      setFormError("Please enter valid name, positive amount, and date.");
      return;
    }
    
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        person_name: addForm.person_name,
        total_amount: amount,
        lending_date: addForm.lending_date
      };
      if (addForm.note) payload.note = addForm.note;
      
      await createLending(payload);
      setShowAddModal(false);
      setAddForm({ person_name: '', total_amount: '', lending_date: new Date().toISOString().split('T')[0], note: '' });
      await fetchData();
    } catch (err) {
      setFormError(getErrorMessage(err) || "Failed to add lending.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepaySubmit = async (lending) => {
    const amount = Number(repayForm.amount);
    if (isNaN(amount) || amount <= 0 || !repayForm.repayment_date) {
      setFormError("Please enter a valid positive amount and date.");
      return;
    }
    if (amount > Number(lending.remaining_amount)) {
      setFormError(`Cannot repay more than remaining (₹${lending.remaining_amount})`);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        amount: amount,
        repayment_date: repayForm.repayment_date
      };
      if (repayForm.note) payload.note = repayForm.note;

      await createRepayment(lending.id, payload);
      setRepayLendingId(null);
      setRepayForm({ amount: '', repayment_date: new Date().toISOString().split('T')[0], note: '' });
      await fetchData();
    } catch (err) {
      setFormError(getErrorMessage(err) || "Failed to record repayment.");
    } finally {
      setSubmitting(false);
    }
  };

  const openRepay = (lending) => {
    setRepayLendingId(lending.id);
    setRepayForm({
      amount: lending.remaining_amount,
      repayment_date: new Date().toISOString().split('T')[0],
      note: ''
    });
    setFormError(null);
  };

  const activeLendings = lendings.filter(l => l.status === 'PENDING' || l.status === 'PARTIAL');
  const settledLendings = lendings.filter(l => l.status === 'FULLY_PAID');
  const displayList = activeTab === 'ACTIVE' ? activeLendings : settledLendings;
  
  if (loading) return (
    <main className="max-w-md mx-auto min-h-screen bg-cream flex flex-col items-center justify-center">
      <p className="font-pixel text-ink mb-4 text-center">COUNTING THE COINS...</p>
      <PixelLoader />
    </main>
  );

  return (
    <main className="max-w-md mx-auto min-h-screen bg-cream pb-32 relative overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col p-4 bg-cyan-light border-b-[3px] border-ink relative z-10">
        <div className="flex items-center gap-3 mb-1">
          <PixelIcon name="lending" size={28} />
          <h1 className="font-pixel text-xl text-ink uppercase">LENDING</h1>
        </div>
        <p className="font-retro text-sm text-ink/80 italic">Money out, coming back 💸</p>
      </div>

      {error && <div className="p-4 pb-0"><PixelError message={error} onRetry={fetchData} /></div>}

      <div className="p-4 flex flex-col gap-6 relative z-10">
        {/* Summary Card */}
        {analytics && analytics.lending && (
          <div className="flex justify-between items-center border-[3px] border-ink p-4 bg-yellow-pp shadow-pixel-sm">
            <div className="flex flex-col">
              <span className="font-pixel text-[10px] text-ink uppercase">Total Lent</span>
              <span className="font-retro text-xl text-ink">₹{Number(analytics.lending.total_lent || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="w-[3px] self-stretch bg-ink mx-2"></div>
            <div className="flex flex-col text-right">
              <span className="font-pixel text-[10px] text-ink uppercase">To Receive</span>
              <span className="font-retro text-xl text-pink-pp">₹{Number(analytics.lending.outstanding_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}

        {/* Toggle Pill */}
        <div>
          <h2 className="font-pixel text-sm text-ink mb-2">WHO OWES ME?</h2>
          <div className="flex border-[3px] border-ink shadow-pixel-sm p-1 bg-cream">
            <button 
              className={`flex-1 font-pixel text-[10px] py-3 uppercase border-[3px] border-transparent transition-transform ${activeTab === 'ACTIVE' ? 'bg-cyan-pp border-ink shadow-pixel-sm translate-y-[-2px]' : 'bg-transparent text-ink/70 hover:bg-black/5'}`}
              onClick={() => setActiveTab('ACTIVE')}
            >
              Active
            </button>
            <button 
              className={`flex-1 font-pixel text-[10px] py-3 uppercase border-[3px] border-transparent transition-transform ${activeTab === 'SETTLED' ? 'bg-mint border-ink shadow-pixel-sm translate-y-[-2px]' : 'bg-transparent text-ink/70 hover:bg-black/5'}`}
              onClick={() => setActiveTab('SETTLED')}
            >
              Settled
            </button>
          </div>
        </div>

        {/* List */}
        {displayList.length === 0 ? (
          <EmptyState 
            title={activeTab === 'ACTIVE' ? "NO ONE OWES YOU YET" : "NO PAID-BACK LENDING YET"} 
            message={activeTab === 'ACTIVE' ? "Lend money to friends and track it here." : "Completed loans will appear here."}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {displayList.map(lending => {
              const tAmt = Number(lending.total_amount);
              const rAmt = Number(lending.amount_repaid);
              let percentage = tAmt > 0 ? (rAmt / tAmt) * 100 : 0;
              if (percentage < 0) percentage = 0;
              if (percentage > 100) percentage = 100;

              return (
                <div key={lending.id} className="border-[3px] border-ink bg-cream shadow-pixel-sm overflow-hidden">
                  <div className="p-3 bg-cream">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <PixelIcon name="profile" size={20} />
                        <h3 className="font-pixel text-sm text-ink truncate">{lending.person_name}</h3>
                      </div>
                      <span className="font-retro text-sm text-ink/70">{lending.lending_date}</span>
                    </div>

                    <div className="flex justify-between items-end mb-1">
                      <span className="font-retro text-lg text-ink">₹{tAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })} lent</span>
                      <span className={`font-pixel text-[10px] px-2 py-1 border-[2px] border-ink uppercase ${lending.status === 'FULLY_PAID' ? 'bg-mint' : lending.status === 'PARTIAL' ? 'bg-yellow-pp' : 'bg-cream'}`}>
                        {lending.status === 'FULLY_PAID' ? '✓ FULLY PAID' : lending.status}
                      </span>
                    </div>

                    {lending.status !== 'FULLY_PAID' && (
                      <div className="flex flex-col gap-1 mt-2 mb-3">
                        <div className="flex justify-between font-retro text-sm">
                          <span className="text-green-600">Paid ₹{rAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          <span className="text-pink-pp">Remaining ₹{Number(lending.remaining_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                        {/* Progress */}
                        <div className="w-full h-3 border-[3px] border-ink bg-cream relative flex items-center">
                          <div 
                            className="absolute top-0 left-0 bottom-0 bg-cyan-pp transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] pointer-events-none opacity-50"></div>
                        </div>
                        <p className="font-pixel text-[8px] text-right mt-0.5">{percentage.toFixed(0)}%</p>
                      </div>
                    )}

                    {lending.status !== 'FULLY_PAID' && repayLendingId !== lending.id && (
                      <PixelButton variant="yellow" className="w-full mt-1 text-sm py-2" onClick={() => openRepay(lending)}>
                        + REPAYMENT
                      </PixelButton>
                    )}

                    {/* Inline Repayment Form */}
                    {repayLendingId === lending.id && (
                      <div className="mt-3 border-t-[3px] border-ink border-dashed pt-3 flex flex-col gap-3">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-pixel text-xs text-ink">RECORD REPAYMENT</h4>
                          <button onClick={() => setRepayLendingId(null)} className="font-retro text-xs text-ink/60 hover:underline">CANCEL</button>
                        </div>
                        
                        {formError && <PixelError message={formError} onRetry={() => setFormError(null)} />}
                        
                        <PixelInput 
                          label="AMOUNT" 
                          type="number" 
                          value={repayForm.amount}
                          onChange={e => setRepayForm({...repayForm, amount: e.target.value})}
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                        <PixelInput 
                          label="DATE" 
                          type="date" 
                          value={repayForm.repayment_date}
                          onChange={e => setRepayForm({...repayForm, repayment_date: e.target.value})}
                        />
                        <div className="flex flex-col gap-1">
                          <label className="font-pixel text-[10px] text-ink">NOTE (OPTIONAL)</label>
                          <textarea 
                            className="w-full border-[3px] border-ink bg-cream px-2 py-1 font-retro text-sm focus:outline-none focus:bg-cyan-light shadow-pixel-sm min-h-[60px]"
                            value={repayForm.note}
                            onChange={e => setRepayForm({...repayForm, note: e.target.value})}
                          />
                        </div>
                        
                        <PixelButton 
                          variant="mint" 
                          onClick={() => handleRepaySubmit(lending)}
                          disabled={submitting}
                          className="mt-1"
                        >
                          {submitting ? 'SAVING...' : 'RECORD REPAYMENT'}
                        </PixelButton>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-[80px] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-gradient-to-t from-cream to-transparent pointer-events-none">
        <PixelButton 
          variant="pink" 
          className="w-full text-lg pointer-events-auto shadow-pixel-sm" 
          onClick={() => setShowAddModal(true)}
        >
          + LEND MONEY
        </PixelButton>
      </div>

      {/* Add Lending Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-cream flex flex-col max-w-md mx-auto overflow-y-auto">
          <div className="flex items-center p-4 bg-yellow-pp border-b-[3px] border-ink sticky top-0 z-10">
            <button onClick={() => setShowAddModal(false)} className="mr-4">
              <PixelIcon name="home" size={24} />
            </button>
            <h1 className="font-pixel text-base text-ink uppercase">NEW LENDING</h1>
          </div>
          
          <div className="p-4 flex flex-col gap-5">
            {formError && <PixelError message={formError} onRetry={() => setFormError(null)} />}
            
            <PixelInput 
              label="PERSON NAME" 
              type="text" 
              value={addForm.person_name}
              onChange={e => setAddForm({...addForm, person_name: e.target.value})}
              placeholder="E.g., Rahul"
            />
            
            <PixelCard tape>
              <div className="relative">
                <PixelInput 
                  label="AMOUNT LENT" 
                  type="number" 
                  value={addForm.total_amount}
                  onChange={e => setAddForm({...addForm, total_amount: e.target.value})}
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
            
            <PixelInput 
              label="LENDING DATE" 
              type="date" 
              value={addForm.lending_date}
              onChange={e => setAddForm({...addForm, lending_date: e.target.value})}
            />
            
            <div className="flex flex-col gap-2">
              <label className="font-pixel text-[10px] text-ink">NOTE (OPTIONAL)</label>
              <textarea 
                className="w-full border-[3px] border-ink bg-cream px-3 py-2 font-retro text-lg focus:outline-none focus:bg-cyan-light shadow-pixel-sm min-h-[100px]"
                value={addForm.note}
                onChange={e => setAddForm({...addForm, note: e.target.value})}
                placeholder="What was this for?"
              />
            </div>
            
            <PixelButton 
              variant="pink" 
              onClick={handleAddSubmit}
              disabled={submitting}
              className="w-full text-lg mt-2 mb-8"
            >
              {submitting ? 'SAVING...' : '✓ CREATE LENDING'}
            </PixelButton>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
};

export default LendingPage;
