import React from 'react';
import PixelIcon from './PixelIcon';
import PixelInput from './PixelInput';
import PixelButton from './PixelButton';

export default function ExpensePeriodSelector({
  periodType, setPeriodType,
  customStartDate, setCustomStartDate,
  customEndDate, setCustomEndDate,
  shiftPeriod, getPeriodLabel,
  onApplyCustom
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex border-[3px] border-ink shadow-pixel-sm p-1 bg-cream overflow-x-auto gap-1 hide-scrollbar">
        {['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'].map(t => (
          <button 
            key={t}
            className={`shrink-0 font-pixel text-[10px] py-2 px-3 uppercase border-[3px] border-transparent transition-transform ${periodType === t ? 'bg-pink-pp border-ink shadow-pixel-sm translate-y-[-2px]' : 'bg-transparent text-ink/70 hover:bg-black/5'}`}
            onClick={() => setPeriodType(t)}
          >
            {t}
          </button>
        ))}
      </div>
      
      {periodType === 'CUSTOM' ? (
        <div className="flex flex-wrap items-end gap-2 border-[3px] border-ink bg-cyan-light p-2 shadow-pixel-sm">
          <div className="flex-1 min-w-[120px]">
            <label className="font-pixel text-[8px] text-ink block mb-1">FROM</label>
            <PixelInput type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="py-1 text-xs" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="font-pixel text-[8px] text-ink block mb-1">TO</label>
            <PixelInput type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="py-1 text-xs" />
          </div>
          <div className="w-full sm:w-auto">
            <PixelButton variant="yellow" onClick={onApplyCustom} className="py-1 px-3 text-xs w-full h-[38px]">APPLY</PixelButton>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center bg-cyan-light border-[3px] border-ink p-2 shadow-pixel-sm">
          <button onClick={() => shiftPeriod(-1)} className="p-1 hover:bg-black/10"><PixelIcon name="arrow-left" size={16} /></button>
          <span className="font-pixel text-xs text-ink uppercase">{getPeriodLabel()}</span>
          <button onClick={() => shiftPeriod(1)} className="p-1 hover:bg-black/10"><PixelIcon name="arrow-left" size={16} style={{transform: 'rotate(180deg)'}} /></button>
        </div>
      )}
    </div>
  );
}
