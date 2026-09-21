import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAuditLogs } from '../api/auditLogs';
import { getErrorMessage } from '../api/client';
import PixelIcon from '../components/PixelIcon';
import PixelCard from '../components/PixelCard';
import PixelButton from '../components/PixelButton';
import PixelInput from '../components/PixelInput';
import EmptyState from '../components/EmptyState';
import PixelLoader from '../components/PixelLoader';
import PixelError from '../components/PixelError';
import BottomNav from '../components/BottomNav';

const ENTITY_TYPES = ['USER', 'ACCOUNT', 'TRANSACTION', 'BILL', 'BUDGET', 'LENDING', 'LENDING_REPAYMENT'];
const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'RESTORE'];

const getEntityIcon = (entityType) => {
  switch (entityType) {
    case 'USER': return 'profile';
    case 'ACCOUNT': return 'computer';
    case 'TRANSACTION': return 'money-stack';
    case 'BILL': return 'bills';
    case 'BUDGET': return 'chart';
    case 'LENDING': return 'lending';
    case 'LENDING_REPAYMENT': return 'handshake';
    default: return 'reports';
  }
};

const getDisplayLabel = (str) => {
  if (!str) return '';
  return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const getActionColor = (action) => {
  switch(action) {
    case 'CREATE': return 'bg-mint text-ink';
    case 'UPDATE': return 'bg-yellow-pp text-ink';
    case 'DELETE': return 'bg-pink-pp text-ink';
    case 'RESTORE': return 'bg-lavender text-ink';
    default: return 'bg-cream text-ink';
  }
};

// Sensitive Key Blocker
const SENSITIVE_TERMS = ['password', 'token', 'secret', 'credential', 'jwt', 'database_url', 'hash'];
const isSensitiveKey = (key) => {
  if (!key) return false;
  const lowerKey = key.toLowerCase();
  return SENSITIVE_TERMS.some(term => lowerKey.includes(term));
};

// Safe formatting for JSON values
const formatValue = (val) => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'number') return val.toString(); // basic string conversion
  if (typeof val === 'string') {
    // Attempt basic naive formatting for strings
    // Date only
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const parts = val.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    // Very basic ISO format detection (T indicates time)
    if (val.includes('T') && val.length > 15) {
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return formatDatetime(val);
      } catch (e) {
        // Fallback
      }
    }
    return val;
  }
  // Arrays/Objects - safely stringify for inline viewing without deep recursion in lists
  if (typeof val === 'object') {
    return Array.isArray(val) ? '[List]' : '{Object}';
  }
  return String(val);
};

// Naive datetime formatter (assuming no TZ logic natively needed per prompt)
const formatDatetime = (dtString) => {
  if (!dtString) return '';
  try {
    const d = new Date(dtString);
    const datePart = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} • ${timePart}`;
  } catch (e) {
    return dtString;
  }
};

// Reusable recursive object viewer for detail modal
const JSONViewer = ({ data }) => {
  if (!data || typeof data !== 'object') return <span className="font-retro text-sm text-ink">{formatValue(data)}</span>;
  
  return (
    <div className="flex flex-col gap-1 pl-2 border-l-[2px] border-ink/20 w-full overflow-hidden">
      {Object.entries(data).map(([k, v]) => {
        if (isSensitiveKey(k)) return null;
        return (
          <div key={k} className="flex flex-col">
            <span className="font-pixel text-[8px] text-ink/70 uppercase truncate">{k}</span>
            {v !== null && typeof v === 'object' ? (
              <JSONViewer data={v} />
            ) : (
              <span className="font-retro text-sm text-ink truncate">{formatValue(v)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};


const AuditLogsPage = () => {
  const navigate = useNavigate();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    entity_type: '',
    action: '',
    start_date: '',
    end_date: '',
    entity_id: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams = { ...filters, page, page_size: pageSize };
      
      // Remove empty filters
      Object.keys(apiParams).forEach(key => {
        if (!apiParams[key]) delete apiParams[key];
      });

      const res = await listAuditLogs(apiParams);
      setLogs(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to load audit activity.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on pagination or filter states explicitly when changed
  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1
  };

  const handleClearFilters = () => {
    setFilters({ entity_type: '', action: '', start_date: '', end_date: '', entity_id: '' });
    setPage(1);
    setShowFilters(false);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setPage(1);
  };

  const openDetail = (log) => {
    setSelectedLog(log);
  };

  // Safe renderer for inline previews
  const renderInlinePreview = (log) => {
    if (log.action === 'CREATE' && log.new_values) {
      const displayKeys = Object.keys(log.new_values).filter(k => !isSensitiveKey(k)).slice(0, 3);
      return (
        <div className="flex flex-col gap-1 mt-2 mb-2">
          {displayKeys.map(k => (
            <div key={k} className="flex justify-between font-retro text-xs text-ink">
              <span className="opacity-70 truncate max-w-[40%]">{k}:</span>
              <span className="truncate max-w-[55%] text-right">{formatValue(log.new_values[k])}</span>
            </div>
          ))}
          {Object.keys(log.new_values).length > 3 && <span className="font-pixel text-[8px] text-ink/50">...more</span>}
        </div>
      );
    }
    if (log.action === 'UPDATE' && log.old_values && log.new_values) {
      // Find diff keys safely
      const keys = Object.keys(log.new_values).filter(k => !isSensitiveKey(k));
      // Try to find actually changed keys if possible, or just show top 3
      let changedKeys = keys.filter(k => log.old_values[k] !== log.new_values[k]).slice(0, 3);
      if (changedKeys.length === 0) changedKeys = keys.slice(0, 2); // fallback
      
      return (
        <div className="flex flex-col gap-1 mt-2 mb-2">
          {changedKeys.map(k => (
            <div key={k} className="flex flex-col font-retro text-xs text-ink">
              <span className="font-pixel text-[8px] opacity-70 uppercase truncate">{k}</span>
              <div className="flex gap-1 items-center">
                <span className="truncate flex-1 bg-ink/5 px-1">{formatValue(log.old_values[k])}</span>
                <span>→</span>
                <span className="truncate flex-1 bg-cyan-light px-1">{formatValue(log.new_values[k])}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (log.action === 'DELETE' && log.old_values) {
      const displayKeys = Object.keys(log.old_values).filter(k => !isSensitiveKey(k)).slice(0, 3);
      return (
        <div className="flex flex-col gap-1 mt-2 mb-2">
          <span className="font-retro text-xs text-ink/70">Deleted values:</span>
          {displayKeys.map(k => (
            <div key={k} className="flex justify-between font-retro text-xs text-ink">
              <span className="opacity-70 truncate max-w-[40%]">{k}:</span>
              <span className="truncate max-w-[55%] text-right line-through">{formatValue(log.old_values[k])}</span>
            </div>
          ))}
        </div>
      );
    }
    if (log.action === 'RESTORE' && log.new_values) {
      return (
        <div className="mt-2 mb-2 font-retro text-xs text-ink/70">
          Entity restored to active state.
        </div>
      );
    }
    return <div className="mt-2 mb-2 font-retro text-xs text-ink/50 italic">No visual preview</div>;
  };

  const hasNextPage = logs.length === pageSize;
  const hasPrevPage = page > 1;

  return (
    <main className="max-w-md mx-auto min-h-screen bg-cream pb-32 relative overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-lavender border-b-[3px] border-ink relative z-10 sticky top-0 shadow-pixel-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} disabled={loading}>
            <PixelIcon name="arrow-left" size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="font-pixel text-base text-ink uppercase">AUDIT LOGS</h1>
            <p className="font-retro text-[10px] text-ink/80 italic">Your Zuzu activity diary.</p>
          </div>
        </div>
        <PixelIcon name="reports" size={24} />
      </div>

      <div className="p-4 flex flex-col gap-4 relative z-10">
        
        {/* Filter Toggle */}
        <div className="flex justify-between items-center border-[3px] border-ink bg-cream p-2 shadow-pixel-sm">
          <span className="font-pixel text-[10px] text-ink uppercase flex items-center gap-2">
            FILTERS <span className="text-[8px] opacity-70">Pg {page}</span>
          </span>
          <button 
            className="font-retro text-xs text-ink underline"
            onClick={() => setShowFilters(!showFilters)}
            disabled={loading}
          >
            {showFilters ? 'HIDE' : 'SHOW'}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-[3px] border-ink bg-cyan-light p-3 shadow-pixel-sm flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">ENTITY TYPE</label>
                <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none"
                  value={filters.entity_type} onChange={e => handleFilterChange('entity_type', e.target.value)} disabled={loading}>
                  <option value="">All</option>
                  {ENTITY_TYPES.map(t => <option key={t} value={t}>{getDisplayLabel(t)}</option>)}
                </select>
              </div>
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">ACTION</label>
                <select className="w-full bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none"
                  value={filters.action} onChange={e => handleFilterChange('action', e.target.value)} disabled={loading}>
                  <option value="">All</option>
                  {ACTIONS.map(a => <option key={a} value={a}>{getDisplayLabel(a)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">START DATE</label>
                <PixelInput 
                  type="date" 
                  value={filters.start_date}
                  onChange={e => handleFilterChange('start_date', e.target.value)}
                  disabled={loading}
                  className="py-1 text-xs"
                />
              </div>
              <div>
                <label className="font-pixel text-[8px] text-ink block mb-1">END DATE</label>
                <PixelInput 
                  type="date" 
                  value={filters.end_date}
                  onChange={e => handleFilterChange('end_date', e.target.value)}
                  disabled={loading}
                  className="py-1 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="font-pixel text-[8px] text-ink block mb-1">ENTITY ID (OPTIONAL)</label>
              <PixelInput 
                type="text" 
                value={filters.entity_id}
                onChange={e => handleFilterChange('entity_id', e.target.value)}
                placeholder="exact id..."
                disabled={loading}
                className="py-1 text-xs"
              />
            </div>
            
            <div className="flex items-center justify-between border-t-[3px] border-ink border-dashed pt-2 mt-1">
              <div className="flex items-center gap-2">
                <label className="font-pixel text-[8px] text-ink">PAGE SIZE</label>
                <select className="bg-cream border-[2px] border-ink p-1 font-retro text-xs focus:outline-none"
                  value={pageSize} onChange={handlePageSizeChange} disabled={loading}>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <button className="font-pixel text-[8px] text-ink hover:underline" onClick={handleClearFilters} disabled={loading}>
                CLEAR FILTERS
              </button>
            </div>
          </div>
        )}

        {error && <PixelError message={error} onRetry={fetchLogs} />}

        {/* List */}
        {loading ? (
           <div className="flex flex-col items-center p-8 gap-4">
             <span className="font-pixel text-ink text-xs uppercase animate-pulse">Checking Activity...</span>
             <PixelLoader />
           </div>
        ) : logs.length === 0 ? (
          <EmptyState 
            title="AUDIT QUIET! 💤" 
            message="No activity matches your filters."
            ctaLabel="CLEAR FILTERS"
            onCtaClick={handleClearFilters}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map(log => (
              <div 
                key={log.id} 
                className="border-[3px] border-ink bg-cream shadow-[4px_4px_0_#1A1A1A] overflow-hidden cursor-pointer hover:bg-yellow-pp/5 transition-colors"
                onClick={() => openDetail(log)}
              >
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2 border-b-[2px] border-ink/20 pb-2">
                    <div className="flex items-center gap-2 max-w-[65%]">
                      <PixelIcon name={getEntityIcon(log.entity_type)} size={16} />
                      <h3 className="font-pixel text-sm text-ink truncate uppercase" title={log.entity_type}>{getDisplayLabel(log.entity_type)}</h3>
                    </div>
                    <span className={`font-pixel text-[8px] px-2 py-1 border-[2px] border-ink ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </div>

                  {renderInlinePreview(log)}

                  <div className="flex justify-between items-end mt-2 pt-2 border-t-[2px] border-ink/20">
                    <span className="font-retro text-[10px] text-ink/50 truncate max-w-[50%]">ID: {log.id ? `${log.id.substring(0, 8)}...` : 'N/A'}</span>
                    <span className="font-retro text-[10px] text-ink/80 text-right">{formatDatetime(log.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination UI */}
        {!loading && logs.length > 0 && (
          <div className="flex justify-between items-center bg-cream border-[3px] border-ink p-2 mt-4 shadow-pixel-sm">
            <PixelButton 
              variant="yellow" 
              className="py-1 px-3 text-xs" 
              disabled={!hasPrevPage} 
              onClick={() => setPage(p => p - 1)}
            >
              ← PREV
            </PixelButton>
            <span className="font-pixel text-[10px] text-ink uppercase">PAGE {page}</span>
            <PixelButton 
              variant="cyan" 
              className="py-1 px-3 text-xs" 
              disabled={!hasNextPage} 
              onClick={() => setPage(p => p + 1)}
            >
              NEXT →
            </PixelButton>
          </div>
        )}
      </div>

      {/* Detail Overlay */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-cream flex flex-col max-w-md mx-auto overflow-y-auto">
          <div className="flex items-center justify-between p-4 bg-yellow-pp border-b-[3px] border-ink sticky top-0 z-10 shadow-pixel-sm">
            <h1 className="font-pixel text-base text-ink uppercase truncate">LOG DETAILS</h1>
            <button onClick={() => setSelectedLog(null)} className="p-1 hover:bg-black/10">
              <PixelIcon name="home" size={24} /> {/* Close icon visual placeholder */}
            </button>
          </div>
          
          <div className="p-4 flex flex-col gap-4 pb-24">
            
            <div className="border-[3px] border-ink bg-cyan-light p-3 shadow-pixel-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-pixel text-xs text-ink uppercase">{getDisplayLabel(selectedLog.entity_type)}</span>
                <span className={`font-pixel text-[8px] px-2 py-1 border-[2px] border-ink ${getActionColor(selectedLog.action)}`}>
                  {selectedLog.action}
                </span>
              </div>
              <div className="font-retro text-xs text-ink mb-1">
                Timestamp: <span className="font-bold">{formatDatetime(selectedLog.created_at)}</span>
              </div>
              <div className="font-retro text-xs text-ink">
                Entity ID: <span className="font-bold break-all bg-cream/50 px-1">{selectedLog.entity_id}</span>
              </div>
            </div>

            {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
              <PixelCard tape>
                <h3 className="font-pixel text-[10px] text-ink uppercase mb-2 border-b-[2px] border-ink pb-1">OLD VALUES</h3>
                <JSONViewer data={selectedLog.old_values} />
              </PixelCard>
            )}

            {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
              <PixelCard tape>
                <h3 className="font-pixel text-[10px] text-ink uppercase mb-2 border-b-[2px] border-ink pb-1">NEW VALUES</h3>
                <JSONViewer data={selectedLog.new_values} />
              </PixelCard>
            )}
            
            <PixelButton 
              variant="yellow" 
              onClick={() => setSelectedLog(null)}
              className="w-full text-sm mt-4"
            >
              CLOSE
            </PixelButton>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
};

export default AuditLogsPage;
