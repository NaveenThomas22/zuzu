import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import PixelIcon from '../components/PixelIcon';
import PixelCard from '../components/PixelCard';
import PixelLoader from '../components/PixelLoader';
import PixelError from '../components/PixelError';
import BottomNav from '../components/BottomNav';

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/api/analytics');
      setData(res.data);
    } catch (err) {
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // For the pixel pie chart, we'll draw simple SVG rects to mimic a pie, or just use a pure SVG pie with crispEdges
  const PieSlice = ({ startAngle, endAngle, color, radius }) => {
    const x1 = 50 + radius * Math.cos(Math.PI * startAngle / 180);
    const y1 = 50 + radius * Math.sin(Math.PI * startAngle / 180);
    const x2 = 50 + radius * Math.cos(Math.PI * endAngle / 180);
    const y2 = 50 + radius * Math.sin(Math.PI * endAngle / 180);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    const d = `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    return <path d={d} fill={color} stroke="#1A1A1A" strokeWidth="2" shapeRendering="crispEdges" />;
  };

  const renderPieChart = (categoriesData) => {
    let entries = [];
    if (Array.isArray(categoriesData)) {
      entries = categoriesData.map(item => ({
        name: item.category_name || 'Unknown',
        val: Number(item.amount) || 0
      }));
    } else if (categoriesData && typeof categoriesData === 'object') {
      entries = Object.entries(categoriesData).map(([name, val]) => ({
        name,
        val: Number(val) || 0
      }));
    }

    entries = entries.filter(e => e.val > 0 && isFinite(e.val)).sort((a, b) => b.val - a.val);

    if (entries.length === 0) return <div className="font-pixel text-[10px] text-ink p-4 text-center">NO EXPENSE DATA YET</div>;
    
    const total = entries.reduce((sum, entry) => sum + entry.val, 0);
    if (total <= 0) return <div className="font-pixel text-[10px] text-ink p-4 text-center">NO EXPENSE DATA YET</div>;

    const colors = ['#F48FB1', '#4DD0E1', '#FFF176', '#A5D6A7', '#CE93D8', '#FFB74D'];
    
    let currentAngle = 0;
    
    return (
      <div className="flex flex-col items-center gap-6 mt-4">
        <svg viewBox="0 0 100 100" className="w-48 h-48 drop-shadow-[4px_4px_0_#1A1A1A]">
          {entries.map((entry, i) => {
            const angle = (entry.val / total) * 360;
            const slice = <PieSlice key={entry.name + i} startAngle={currentAngle} endAngle={currentAngle + angle} color={colors[i % colors.length]} radius={45} />;
            currentAngle += angle;
            return slice;
          })}
        </svg>
        
        <div className="w-full flex flex-col gap-2 mt-4">
          {entries.map((entry, i) => (
            <div key={entry.name + i} className="flex items-center justify-between font-retro text-lg text-ink">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-ink" style={{ backgroundColor: colors[i % colors.length] }}></div>
                <span>{entry.name}</span>
              </div>
              <span className="font-pixel text-[10px]">₹{Number(entry.val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ({((entry.val/total)*100).toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthlyTrend = (monthlyData) => {
    if (!monthlyData) return <div className="font-pixel text-[10px] text-ink p-4 text-center">NO DATA</div>;
    
    let parsedData = [];
    if (Array.isArray(monthlyData)) {
      parsedData = monthlyData;
    } else {
      parsedData = Object.entries(monthlyData).map(([key, val]) => ({
        month: key.length >= 7 ? new Date(key + (key.length === 7 ? '-01' : '')).toLocaleString('default', { month: 'short' }).toUpperCase() : key,
        income: val.income || 0,
        expense: val.expense || 0
      }));
    }
    
    if (parsedData.length === 0) return <div className="font-pixel text-[10px] text-ink p-4 text-center">NO DATA</div>;
    
    const last5 = parsedData.slice(-5);
    const maxVal = Math.max(...last5.map(d => Math.max(d.income, d.expense)), 1);

    return (
      <>
        <div className="h-40 flex items-end justify-between px-2 gap-2 mt-8 border-b-[3px] border-ink pb-1">
          {last5.map((d, i) => {
            const incPct = Math.max((d.income / maxVal) * 100, 2);
            const expPct = Math.max((d.expense / maxVal) * 100, 2);
            return (
              <div key={i} className="flex gap-1 items-end h-full w-full justify-center">
                <div className="w-3 bg-mint border-2 border-ink shadow-[2px_2px_0_#1A1A1A]" style={{ height: `${incPct}%` }}></div>
                <div className="w-3 bg-pink-pp border-2 border-ink shadow-[2px_2px_0_#1A1A1A]" style={{ height: `${expPct}%` }}></div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between px-2 mt-2">
          {last5.map((d, i) => (
            <span key={i} className="font-pixel text-[8px] text-ink flex-1 text-center">{d.month || 'M'}</span>
          ))}
        </div>
      </>
    );
  };

  return (
    <main className="max-w-md mx-auto min-h-screen bg-cream pb-24">
      <div className="flex items-center justify-between p-4 bg-lavender border-b-[3px] border-ink">
        <h1 className="font-pixel text-base text-ink uppercase">Reports</h1>
        <div className="border-[3px] border-ink bg-cream p-2 shadow-pixel-sm cursor-pointer flex items-center gap-2">
          <span className="font-pixel text-[10px]">THIS MONTH</span>
          <span className="font-pixel text-[10px]">▾</span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-6 mt-2">
        {loading ? (
          <PixelLoader />
        ) : error ? (
          <PixelError message={error} onRetry={fetchReports} />
        ) : (
          <>
            <PixelCard tape>
              <h2 className="font-pixel text-xs text-ink mb-2">EXPENSES BY CATEGORY</h2>
              <div className="border-t-[3px] border-ink w-full mb-4"></div>
              {renderPieChart(data?.expense_by_category)}
            </PixelCard>

            <PixelCard>
              <h2 className="font-pixel text-xs text-ink mb-2">MONTHLY TREND</h2>
              <div className="border-t-[3px] border-ink w-full mb-4"></div>
              {renderMonthlyTrend(data?.monthly_income_expense)}
            </PixelCard>

            <div className="border-[3px] border-ink bg-yellow-pp p-4 shadow-pixel text-center transform -rotate-1 mx-2 mt-4">
              <p className="font-retro text-lg italic text-ink">Not just expenses… a better you ♥</p>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
};

export default ReportsPage;
