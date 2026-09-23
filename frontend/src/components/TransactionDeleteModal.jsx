import React, { useState } from 'react';
import { deleteTransaction } from '../api/transactions';
import PixelButton from './PixelButton';
import PixelCard from './PixelCard';
import PixelError from './PixelError';

export default function TransactionDeleteModal({ transaction, isOpen, onClose, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !transaction) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteTransaction(transaction.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDatetime = (dtString) => {
    if (!dtString) return '';
    try {
      const d = new Date(dtString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dtString;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-cream/90 flex flex-col items-center justify-center p-4">
      <PixelCard tape className="w-full max-w-sm flex flex-col gap-4">
        {error && <PixelError message={error} onRetry={() => setError(null)} />}
        
        <div className="text-center">
          <h2 className="font-pixel text-lg text-ink uppercase">DELETE TRANSACTION?</h2>
          <p className="font-retro text-xs text-ink/70 mt-2">Are you sure you want to delete this transaction?</p>
        </div>

        <div className="border-[3px] border-ink bg-pink-pp/20 p-3 shadow-pixel-sm flex flex-col items-center gap-1 text-center">
          {transaction.item_name && (
            <span className="font-retro text-sm text-ink font-bold truncate max-w-[200px]">{transaction.item_name}</span>
          )}
          <span className="font-pixel text-xl text-pink-pp">
            ₹{Number(transaction.amount).toLocaleString('en-IN')}
          </span>
          <span className="font-pixel text-[10px] bg-cream border-[2px] border-ink px-2 py-0.5 mt-1">
            {transaction.transaction_type}
          </span>
          <span className="font-retro text-[10px] text-ink/70 mt-1">
            {formatDatetime(transaction.transaction_date)}
          </span>
        </div>

        <p className="font-retro text-[10px] text-center text-ink/80 italic">
          This will remove the transaction from your balance and reports.
        </p>

        <div className="flex gap-2 mt-2">
          <PixelButton variant="cyan" onClick={onClose} disabled={isDeleting} className="flex-1 py-2 text-sm">
            CANCEL
          </PixelButton>
          <PixelButton variant="yellow" onClick={handleDelete} disabled={isDeleting} className="flex-1 py-2 text-sm text-pink-pp">
            {isDeleting ? 'DELETING...' : 'DELETE'}
          </PixelButton>
        </div>
      </PixelCard>
    </div>
  );
}
