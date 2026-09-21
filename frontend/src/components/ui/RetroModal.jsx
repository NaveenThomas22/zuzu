import { useEffect, useRef } from 'react';

/**
 * RetroModal — Centered modal with a 90s window title bar.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} [props.title]
 * @param {React.ReactNode} props.children
 * @param {'sm'|'md'|'lg'} [props.size='md']
 */
export default function RetroModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}) {
  const dialogRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeMap = {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-near-black/40" />

      {/* Modal window */}
      <div
        ref={dialogRef}
        className={`
          relative
          w-full ${sizeMap[size] || sizeMap.md}
          border-3 border-border-black
          rounded-retro-lg
          shadow-retro-xl
          bg-cream-light
          animate-bounce-in
          overflow-hidden
          ${className}
        `}
      >
        {/* Title bar (90s window style) */}
        {title && (
          <div className="flex items-center justify-between px-3 py-2 bg-retro-pink border-b-3 border-border-black">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-retro-yellow border-2 border-border-black rounded-full" />
              <span className="inline-block w-3 h-3 bg-retro-green border-2 border-border-black rounded-full" />
            </div>
            <h3 className="font-[family-name:var(--font-pixel)] text-[10px] text-near-black truncate mx-3">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="
                flex items-center justify-center
                w-6 h-6
                bg-cream-light
                border-2 border-border-black
                rounded-sm
                text-xs font-bold text-near-black
                hover:bg-danger hover:text-white
                transition-colors duration-100
              "
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
