import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listBills, createBill, updateBill, deleteBill, payBill, cancelBill } from '../api/bills';
import { getErrorMessage } from '../api/client';
import PixelIcon from '../components/PixelIcon';
import PixelCard from '../components/PixelCard';
import PixelButton from '../components/PixelButton';
import PixelInput from '../components/PixelInput';
import EmptyState from '../components/EmptyState';
import PixelLoader from '../components/PixelLoader';
import PixelError from '../components/PixelError';
import BottomNav from '../components/BottomNav';

const BILL_TYPES = ['MOBILE_RECHARGE', 'ELECTRICITY', 'WATER', 'INTERNET', 'GAS', 'SUBSCRIPTION', 'OTHER'];
const FREQUENCIES = ['ONE_TIME', 'WEEKLY', 'MONTHLY', 'YEARLY'];
const STATUSES = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];

const getTypeIcon = (type) => {
  switch (type) {
    case 'MOBILE_RECHARGE': return 'profile';
    case 'ELECTRICITY': return 'sun';
    case 'WATER': return 'other';
    case 'INTERNET': return 'computer';
    case 'GAS': return 'home';
    case 'SUBSCRIPTION': return 'reports';
    default: return 'bills';
  }
};

const getDisplayLabel = (str) => {
  if (!str) return '';
  return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const BillsPage = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    bill_type: '',
    frequency: '',
    start_date: '',
    end_date: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Modals & Action States
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [payConfirmId, setPayConfirmId] = useState(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({ 
    bill_type: 'ELECTRICITY', 
    name: '', 
    amount: '', 
    due_date: new Date().toISOString().split('T')[0],
    frequency: 'MONTHLY',
    note: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams = { ...filters };
      // If user selected OVERDUE filter, we must ask API for PENDING and filter locally
      if (apiParams.status === 'OVERDUE') {
        apiParams.status = 'PENDING';
      }
      
      // Remove empty filters
      Object.keys(apiParams).forEach(key => {
        if (!apiParams[key]) delete apiParams[key];
      });

      const res = await listBills(apiParams);
      let fetchedBills = res.data || [];
      
      // Handle local OVERDUE filtering if specifically requested
      if (filters.status === 'OVERDUE') {
        fetchedBills = fetchedBills.filter(b => b.status === 'OVERDUE');
      }
      
      setBills(fetchedBills);
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to load bills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({ status: '', bill_type: '', frequency: '', start_date: '', end_date: '' });
    setShowFilters(false);
  };

  const openAdd = () => {
    setFormData({ 
      bill_type: 'ELECTRICITY', 
      name: '', 
      amount: '', 
      due_date: new Date().toISOString().split('T')[0],
      frequency: 'MONTHLY',
      note: ''
    });
    setIsEditing(false);
    setEditId(null);
    setFormError(null);
    setShowAddModal(true);
  };

  const openEdit = (bill) => {
    setFormData({ 
      bill_type: bill.bill_type, 
      name: bill.name, 
      amount: bill.amount, 
      due_date: bill.due_date,
      frequency: bill.frequency,
      note: bill.note || ''
    });
    setIsEditing(true);
    setEditId(bill.id);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.name.trim() || formData.name.length > 150) {
      setFormError("Please enter a valid name (1-150 characters).");
      return;
    }
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Amount must be greater than 0.");
      return;
    }
    if (!formData.due_date) {
      setFormError("Due date is required.");
      return;
    }
    
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        name: formData.name.trim(),
        bill_type: formData.bill_type,
        amount: Number(amt).toFixed(2).toString(), // ensure decimal string
        due_date: formData.due_date,
        frequency: formData.frequency,
      };
      if (formData.note) payload.note = formData.note;

      if (isEditing) {
        await updateBill(editId, payload);
      } else {
        await createBill(payload);
      }
      setShowAddModal(false);
      await fetchBills();
    } catch (err) {
      setFormError(getErrorMessage(err) || "Failed to save bill.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (billId) => {
    setSubmitting(true);
    setError(null);
    try {
      await payBill(billId, { payment_date: paymentDate });
      setPayConfirmId(null);
      await fetchBills();
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to pay bill.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (billId) => {
    setSubmitting(true);
    setError(null);
    try {
      await cancelBill(billId);
      setCancelConfirmId(null);
      await fetchBills();
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to cancel bill.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (billId) => {
    setSubmitting(true);
    setError(null);
    try {
      await deleteBill(billId);
      setDeleteConfirmId(null);
      await fetchBills();
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to delete bill.");
    } finally {
      setSubmitting(false);
    }
  };

  // Summaries calculation based strictly on loaded data
  const upcomingBills = bills.filter(b => b.status === 'PENDING');
  const overdueBills = bills.filter(b => b.status === 'OVERDUE');
  const paidBills = bills.filter(b => b.status === 'PAID');

  const upcomingTotal = upcomingBills.reduce((acc, b) => acc + parseFloat(b.amount || 0), 0);
  const overdueTotal = overdueBills.reduce((acc, b) => acc + parseFloat(b.amount || 0), 0);
  const paidTotal = paidBills.reduce((acc, b) => acc + parseFloat(b.amount || 0), 0);

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-pp';
      case 'PAID': return 'bg-mint';
      case 'OVERDUE': return 'bg-pink-pp';
      case 'CANCELLED': return 'bg-cream opacity-70';
      default: return 'bg-cream';
    }
  };

  return (
    <main className="max-w-md mx-auto min-h-screen bg-cream pb-32 relative overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-cyan-light border-b-[3px] border-ink relative z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <PixelIcon name="arrow-left" size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="font-pixel text-base text-ink uppercase">BILLS</h1>
            <p className="font-retro text-[10px] text-ink/80 italic">Keep payments under control.</p>
          </div>
        </div>
        <PixelIcon name="bills" size={24} />
      </div>

      <div className="p-4 flex flex-col gap-4 relative z-10">
        {error && <PixelError message={error} onRetry={fetchBills} />}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="border-[3px] border-ink bg-yellow-pp p-2 flex flex-col justify-center text-center shadow-pixel-sm">
            <span className="font-pixel text-[8px] uppercase">Upcoming</span>
            <span className="font-pixel text-xs mt-1">₹{upcomingTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="border-[3px] border-ink bg-pink-pp p-2 flex flex-col justify-center text-center shadow-pixel-sm">
            <span className="font-pixel text-[8px] uppercase text-ink">Overdue</span>
            <span className="font-pixel text-xs mt-1 text-ink">₹{overdueTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="border-[3px] border-ink bg-mint p-2 flex flex-col justify-center text-center shadow-pixel-sm">
            <span className="font-pixel text-[8px] uppercase">Paid</span>
            <span className="font-pixel text-xs mt-1">₹{paidTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex justify-between items-center border-b-[3px] border-ink pb-2 mt-2">
          <span className="font-pixel text-xs text-ink uppercase">Your Bills</span>
          <button 
            className="font-retro text-xs text-ink underline"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'HIDE FILTERS' : 'FILTERS'}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-[3px] border-ink bg-lavender p-3 shadow-pixel-sm flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">STATUS</label>
                <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none"
                  value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                  <option value="">All</option>
                  {STATUSES.map(s => <option key={s} value={s}>{getDisplayLabel(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">TYPE</label>
                <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none"
                  value={filters.bill_type} onChange={e => setFilters({...filters, bill_type: e.target.value})}>
                  <option value="">All</option>
                  {BILL_TYPES.map(t => <option key={t} value={t}>{getDisplayLabel(t)}</option>)}
                </select>
              </div>
            </div>
            <button className="font-retro text-xs text-ink underline text-center" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        {/* List */}
        {loading ? (
           <div className="flex justify-center p-8"><PixelLoader /></div>
        ) : bills.length === 0 ? (
          <EmptyState 
            title="NO BILLS YET!" 
            message="Your future payments will appear here."
            ctaLabel="+ Add Bill"
            ctaTo="#"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {bills.map(bill => (
              <div key={bill.id} className="border-[3px] border-ink bg-cream shadow-pixel-sm overflow-hidden flex flex-col">
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 max-w-[65%]">
                      <div className={`p-1 border-[2px] border-ink ${getStatusColor(bill.status)}`}>
                        <PixelIcon name={getTypeIcon(bill.bill_type)} size={16} />
                      </div>
                      <h3 className="font-pixel text-sm text-ink truncate" title={bill.name}>{bill.name}</h3>
                    </div>
                    <span className={`font-pixel text-[8px] px-1.5 py-1 border-[2px] border-ink ${getStatusColor(bill.status)}`}>
                      {bill.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-end mb-2">
                    <span className="font-retro text-xl text-ink">₹{Number(bill.amount).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                    <div className="flex flex-col items-end">
                      <span className="font-retro text-xs text-ink/70 uppercase">{getDisplayLabel(bill.frequency)}</span>
                      <span className="font-retro text-xs text-ink/80 font-bold">
                        {bill.status === 'PAID' ? 'Paid: ' : 'Due: '} 
                        {bill.status === 'PAID' && bill.paid_at ? new Date(bill.paid_at).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) : new Date(bill.due_date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-2 mt-3 pt-3 border-t-[3px] border-ink border-dashed">
                    {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
                      <PixelButton variant="mint" className="flex-1 py-1 text-[10px]" onClick={() => setPayConfirmId(bill.id)}>PAY</PixelButton>
                    )}
                    <PixelButton variant="yellow" className="flex-1 py-1 text-[10px]" onClick={() => openEdit(bill)}>EDIT</PixelButton>
                    
                    {/* Secondary menu for Cancel/Delete */}
                    {!cancelConfirmId && !deleteConfirmId && bill.status !== 'CANCELLED' && bill.status !== 'PAID' && (
                      <button className="px-2 font-pixel text-[8px] border-[2px] border-ink hover:bg-ink hover:text-cream transition-colors" onClick={() => setCancelConfirmId(bill.id)}>X</button>
                    )}
                    <button className="px-2 font-pixel text-[8px] border-[2px] border-ink text-pink-pp hover:bg-pink-pp hover:text-ink transition-colors" onClick={() => setDeleteConfirmId(bill.id)}>DEL</button>
                  </div>

                  {/* Inline Modals */}
                  {payConfirmId === bill.id && (
                    <div className="mt-2 p-2 bg-mint/20 border-[2px] border-ink flex flex-col gap-2">
                      <p className="font-pixel text-[10px] text-ink uppercase text-center">PAY {getDisplayLabel(bill.bill_type)} BILL?</p>
                      <p className="font-retro text-xs text-ink text-center">₹{Number(bill.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                      <PixelInput 
                        label="PAYMENT DATE" 
                        type="date" 
                        value={paymentDate}
                        onChange={e => setPaymentDate(e.target.value)}
                      />
                      <div className="flex gap-2 mt-1">
                        <PixelButton variant="yellow" className="flex-1 text-xs" onClick={() => setPayConfirmId(null)} disabled={submitting}>CANCEL</PixelButton>
                        <PixelButton variant="mint" className="flex-1 text-xs" onClick={() => handlePay(bill.id)} disabled={submitting}>
                          {submitting ? '...' : 'PAY BILL'}
                        </PixelButton>
                      </div>
                    </div>
                  )}

                  {cancelConfirmId === bill.id && (
                    <div className="mt-2 p-2 bg-cream border-[2px] border-ink flex flex-col gap-2">
                      <p className="font-pixel text-[10px] text-ink uppercase text-center">CANCEL THIS BILL?</p>
                      <p className="font-retro text-xs text-ink text-center mb-1">This cannot be undone.</p>
                      <div className="flex gap-2 mt-1">
                        <PixelButton variant="yellow" className="flex-1 text-xs" onClick={() => setCancelConfirmId(null)} disabled={submitting}>KEEP BILL</PixelButton>
                        <PixelButton variant="pink" className="flex-1 text-xs" onClick={() => handleCancel(bill.id)} disabled={submitting}>
                          {submitting ? '...' : 'CANCEL BILL'}
                        </PixelButton>
                      </div>
                    </div>
                  )}

                  {deleteConfirmId === bill.id && (
                    <div className="mt-2 p-2 bg-pink-pp/20 border-[2px] border-ink flex flex-col gap-2">
                      <p className="font-pixel text-[10px] text-ink uppercase text-center">DELETE THIS BILL?</p>
                      <p className="font-retro text-xs text-ink text-center mb-1">Removes it permanently.</p>
                      <div className="flex gap-2 mt-1">
                        <PixelButton variant="yellow" className="flex-1 text-xs" onClick={() => setDeleteConfirmId(null)} disabled={submitting}>CANCEL</PixelButton>
                        <PixelButton variant="pink" className="flex-1 text-xs" onClick={() => handleDelete(bill.id)} disabled={submitting}>
                          {submitting ? '...' : 'DELETE'}
                        </PixelButton>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 z-40 bg-gradient-to-t from-cream via-cream to-transparent pointer-events-none pb-24">
        <PixelButton 
          variant="pink" 
          className="w-full text-lg pointer-events-auto shadow-pixel-sm" 
          onClick={openAdd}
        >
          + ADD BILL
        </PixelButton>
      </div>

      {/* Add / Edit Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-cream flex flex-col max-w-md mx-auto overflow-y-auto">
          <div className="flex items-center p-4 bg-yellow-pp border-b-[3px] border-ink sticky top-0 z-10">
            <button onClick={() => setShowAddModal(false)} className="mr-4" disabled={submitting}>
              <PixelIcon name="arrow-left" size={24} />
            </button>
            <h1 className="font-pixel text-base text-ink uppercase">{isEditing ? 'EDIT BILL' : 'NEW BILL'}</h1>
          </div>
          
          <div className="p-4 flex flex-col gap-5 pb-24">
            {formError && <PixelError message={formError} onRetry={() => setFormError(null)} />}
            
            <PixelInput 
              label="BILL NAME" 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="E.g., TNEB Electricity"
              disabled={submitting}
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-pixel text-xs text-ink mb-2 block">BILL TYPE</label>
                <PixelCard className="p-0 overflow-hidden" tape>
                  <select
                    value={formData.bill_type}
                    onChange={e => setFormData({...formData, bill_type: e.target.value})}
                    className="w-full bg-cream border-none px-2 py-3 font-retro text-sm text-ink focus:outline-none appearance-none cursor-pointer"
                    disabled={submitting}
                  >
                    {BILL_TYPES.map(type => (
                      <option key={type} value={type}>{getDisplayLabel(type)}</option>
                    ))}
                  </select>
                </PixelCard>
              </div>

              <div>
                <label className="font-pixel text-xs text-ink mb-2 block">FREQUENCY</label>
                <PixelCard className="p-0 overflow-hidden" tape>
                  <select
                    value={formData.frequency}
                    onChange={e => setFormData({...formData, frequency: e.target.value})}
                    className="w-full bg-cream border-none px-2 py-3 font-retro text-sm text-ink focus:outline-none appearance-none cursor-pointer"
                    disabled={submitting}
                  >
                    {FREQUENCIES.map(f => (
                      <option key={f} value={f}>{getDisplayLabel(f)}</option>
                    ))}
                  </select>
                </PixelCard>
              </div>
            </div>

            <PixelCard tape>
              <div className="relative">
                <PixelInput 
                  label="AMOUNT" 
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
            
            <PixelInput 
              label="DUE DATE" 
              type="date" 
              value={formData.due_date}
              onChange={e => setFormData({...formData, due_date: e.target.value})}
              disabled={submitting}
            />
            
            <div className="flex flex-col gap-2">
              <label className="font-pixel text-xs text-ink">NOTE (OPTIONAL)</label>
              <textarea 
                className="w-full border-[3px] border-ink bg-cream px-3 py-2 font-retro text-lg focus:outline-none focus:bg-cyan-light shadow-pixel-sm min-h-[80px]"
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
                placeholder="Details..."
                disabled={submitting}
              />
            </div>
            
            <PixelButton 
              variant="mint" 
              onClick={handleFormSubmit}
              disabled={submitting}
              className="w-full text-lg mt-4"
            >
              {submitting ? 'SAVING...' : isEditing ? '✓ SAVE CHANGES' : '✓ CREATE BILL'}
            </PixelButton>
          </div>
        </div>
      )}

      {/* Since Bills is not in BottomNav officially, we just overlay empty bottom nav spacing, but let's just keep BottomNav to match aesthetic if they navigate from elsewhere */}
      <BottomNav />
    </main>
  );
};

export default BillsPage;
