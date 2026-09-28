import React, { useState } from 'react';
import PixelButton from './PixelButton';
import PixelIcon from './PixelIcon';
import apiClient from '../api/client';

export default function ExportPdfButton({ endpoint, params = {}, filename = "Export.pdf", className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await apiClient.get(endpoint, {
        params,
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let downloadFilename = filename;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          downloadFilename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', downloadFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('PDF Export Error:', err);
      setError("Unable to generate PDF. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <PixelButton
        variant="cyan"
        onClick={handleExport}
        disabled={loading}
        className="flex items-center justify-center gap-1.5 text-[11px] h-[36px] !py-0 !px-[12px] whitespace-nowrap w-auto shrink-0"
      >
        <span className="text-[12px]">↓</span>
        <span>{loading ? "GENERATING..." : "EXPORT PDF"}</span>
      </PixelButton>
      {error && (
        <div className="absolute top-full mt-1 bg-pink-pp border-[2px] border-ink p-1 text-[8px] font-pixel text-ink shadow-pixel z-10 whitespace-nowrap text-center">
          {error}
        </div>
      )}
      {success && !error && (
        <div className="absolute top-full mt-1 bg-mint border-[2px] border-ink p-1 text-[8px] font-pixel text-ink shadow-pixel z-10 whitespace-nowrap text-center">
          PDF exported successfully.
        </div>
      )}
    </div>
  );
}
