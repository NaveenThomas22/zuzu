export function canModifyTransaction(transaction) {
  if (!transaction) return false;
  
  if (transaction.transaction_type === 'LENDING_OUT') return false;
  if (transaction.transaction_type === 'LENDING_REPAYMENT') return false;
  if (transaction.bill_id) return false;
  
  return true;
}
