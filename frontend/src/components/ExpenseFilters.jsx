import React from 'react';

export default function ExpenseFilters({
  filters, setFilters,
  categoriesList, subcategoriesList, accountsList
}) {
  return (
    <div className="border-[3px] border-ink bg-cream p-3 shadow-pixel-sm flex flex-col gap-3">
      <h3 className="font-pixel text-[10px] text-ink border-b-[2px] border-ink pb-1">FILTERS</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-pixel text-[8px] text-ink block mb-1">CATEGORY</label>
          <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none truncate"
            value={filters.category_id} onChange={e => setFilters({...filters, category_id: e.target.value, subcategory_id: ''})}>
            <option value="">All Categories</option>
            {categoriesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="font-pixel text-[8px] text-ink block mb-1">SUBCATEGORY</label>
          <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none truncate"
            value={filters.subcategory_id} onChange={e => setFilters({...filters, subcategory_id: e.target.value})} disabled={!filters.category_id}>
            <option value="">All Subcategories</option>
            {subcategoriesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="font-pixel text-[8px] text-ink block mb-1">NEED / WANT</label>
          <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none"
            value={filters.need_or_want} onChange={e => setFilters({...filters, need_or_want: e.target.value})}>
            <option value="">All</option>
            <option value="NEED">NEED</option>
            <option value="WANT">WANT</option>
          </select>
        </div>
        <div>
          <label className="font-pixel text-[8px] text-ink block mb-1">ACCOUNT</label>
          <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none truncate"
            value={filters.account_id} onChange={e => setFilters({...filters, account_id: e.target.value})}>
            <option value="">All Accounts</option>
            {accountsList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end mt-1">
        <button className="font-pixel text-[8px] text-ink hover:underline" onClick={() => setFilters({ category_id: '', subcategory_id: '', need_or_want: '', account_id: '' })}>
          RESET FILTERS
        </button>
      </div>
    </div>
  );
}
