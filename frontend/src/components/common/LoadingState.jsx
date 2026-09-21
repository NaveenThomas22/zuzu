/**
 * LoadingState — Retro pixel-art loading indicator.
 *
 * @param {object} props
 * @param {string} [props.message='Loading...']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.fullPage=false] - Center in viewport
 */
export default function LoadingState({
  message = 'Loading...',
  size = 'md',
  fullPage = false,
}) {
  const sizeStyles = {
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-20',
  };

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        ${fullPage ? 'min-h-[60vh]' : sizeStyles[size]}
        animate-fade-in
      `}
      role="status"
      aria-label="Loading"
    >
      {/* Pixel loading dots */}
      <div className="flex gap-2 mb-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-4 h-4 bg-retro-pink border-2 border-border-black rounded-sm"
            style={{
              animation: `loading-dots 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Pixel text */}
      <p className="font-[family-name:var(--font-pixel)] text-[10px] text-dark-gray tracking-wider">
        {message}
      </p>

      {/* Retro progress bar animation */}
      <div className="mt-3 w-32 h-2.5 bg-cream-dark border-2 border-border-black rounded-sm overflow-hidden">
        <div
          className="h-full bg-retro-cyan rounded-sm"
          style={{
            animation: 'loading-bar 1.5s ease-in-out infinite',
            width: '40%',
          }}
        />
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}
