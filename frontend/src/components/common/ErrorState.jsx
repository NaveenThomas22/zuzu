import RetroButton from '../ui/RetroButton';
import { PixelCross } from '../pixel/PixelIcons';

/**
 * ErrorState — Error display with retry button.
 *
 * @param {object} props
 * @param {string} [props.message] - Error message from API
 * @param {() => void} [props.onRetry] - Retry callback
 * @param {boolean} [props.fullPage=false]
 */
export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  fullPage = false,
  className = '',
}) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        ${fullPage ? 'min-h-[60vh]' : 'py-12'}
        px-6
        text-center
        animate-fade-in
        ${className}
      `}
      role="alert"
    >
      {/* Error pixel art */}
      <div className="text-danger mb-4">
        <PixelCross size={48} />
      </div>

      {/* Error card */}
      <div className="
        bg-danger-bg
        border-[3px] border-danger
        rounded-retro
        shadow-retro-pink
        px-6 py-4
        max-w-[300px]
      ">
        <h3 className="font-[family-name:var(--font-pixel)] text-[10px] text-danger mb-2">
          Oops!
        </h3>
        <p className="font-[family-name:var(--font-hand)] text-lg text-near-black">
          {message}
        </p>
      </div>

      {/* Retry button */}
      {onRetry && (
        <div className="mt-5">
          <RetroButton variant="secondary" size="sm" onClick={onRetry}>
            Try Again
          </RetroButton>
        </div>
      )}
    </div>
  );
}
