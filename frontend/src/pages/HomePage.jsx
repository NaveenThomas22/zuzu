import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import HomeHeader from '../components/HomeHeader';
import BalanceCard from '../components/BalanceCard';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import PixelLoader from '../components/PixelLoader';
import PixelError from '../components/PixelError';
import BottomNav from '../components/BottomNav';
import PixelIcon from '../components/PixelIcon';
import PixelSparkles from '../components/PixelSparkles';
import PixelDoodle from '../components/PixelDoodle';
import PixelDecoration from '../components/PixelDecoration';

const HomePage = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const [sumRes, txRes] = await Promise.all([
        apiClient.get('/api/summary'),
        apiClient.get(`/api/transactions?start_date=${firstDay}&end_date=${lastDay}`)
      ]);
      
      setSummary(sumRes.data);
      setTransactions((txRes.data.transactions || txRes.data).slice(0, 5));
    } catch (err) {
      console.error("Error fetching home data", err);
      setError("Failed to load your financial data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <main className="max-w-md mx-auto min-h-screen bg-cream"><PixelLoader /></main>;
  if (error) return <main className="max-w-md mx-auto min-h-screen bg-cream"><PixelError message={error} onRetry={fetchData} /></main>;
  if (!summary) return null;

  return (
    <main className="relative max-w-md mx-auto min-h-screen bg-cream pb-24 overflow-hidden z-10">
      <PixelSparkles />
      
      <HomeHeader />
      <BalanceCard balance={summary.current_balance} />
      
      <div className="grid grid-cols-3 gap-2 px-4 mt-4">
        <StatCard label="MONEY IN" value={summary.total_income} color="mint" iconName="arrow-up" smallText />
        <StatCard label="MONEY OUT" value={summary.total_expense} color="pink" iconName="arrow-down" smallText />
        <StatCard label="LENDING" value={summary.total_lending_out || 0} color="yellow" iconName="handshake" smallText />
      </div>
      
      <div className="px-4 mt-2">
        <StatCard label="INVESTMENTS" value={summary.total_investment || 0} color="lavender" iconName="chart" />
      </div>

      <div className="px-4 mt-6 relative z-10">
        <div className="flex justify-between items-end mb-4 border-b-[3px] border-ink pb-2 relative gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-pixel text-xs text-ink whitespace-nowrap">THIS MONTH</h2>
            <PixelDoodle type="book" size={16} className="-mt-1" />
          </div>
          <Link to="/transactions" className="font-retro text-sm text-pink-pp hover:underline whitespace-nowrap">SEE ALL →</Link>
        </div>

        {transactions.length === 0 ? (
          <EmptyState 
            title="No transactions yet" 
            message="Let's make it happen!" 
            ctaLabel="ADD TRANSACTION" 
            ctaTo="/add" 
          />
        ) : (
          <div className="flex flex-col gap-3">
            {transactions.map(tx => {
              const iconName = tx.transaction_type?.toLowerCase().replace('_', '-') || 'other';
              const displayName = tx.transaction_type?.replace('_', ' ') || 'TRANSACTION';
              const isIncome = tx.transaction_type === 'INCOME' || tx.transaction_type === 'REFUND';
              
              return (
                <div key={tx.id} className="flex items-center justify-between border-[3px] border-ink shadow-pixel-sm p-3 bg-cream">
                  <div className="flex items-center gap-3">
                    <div className="border-[3px] border-ink p-1 bg-yellow-pp">
                      <PixelIcon name={iconName} size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-pixel text-[10px] uppercase text-ink">{displayName}</span>
                      <span className="font-retro text-base text-ink">{tx.item_name || tx.description || 'No description'}</span>
                    </div>
                  </div>
                  <span className={`font-pixel text-sm ${isIncome ? 'text-green-600' : 'text-pink-pp'} whitespace-nowrap`}>
                    {isIncome ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PixelDecoration />
      <BottomNav />
    </main>
  );
};

export default HomePage;
