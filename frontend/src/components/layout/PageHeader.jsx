import { useNavigate } from 'react-router-dom';

/**
 * PageHeader — Cyan retro page title with optional back button and right action.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {boolean} [props.showBack=false]
 * @param {React.ReactNode} [props.rightAction]
 * @param {string} [props.subtitle]
 */
export default function PageHeader({
  title,
  showBack = false,
  rightAction,
  subtitle,
  className = '',
}) {
  const navigate = useNavigate();

  return (
    <header
      className={`
        flex items-center justify-between
        px-4 py-3
        bg-retro-cyan
        border-b-[4px] border-border-black
        sticky top-0 z-30
        ${className}
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="
              flex items-center justify-center
              w-9 h-9
              bg-cream-light
              border-[3px] border-border-black
              shadow-retro-sm
              text-near-black text-lg
              hover:bg-cream-dark
              active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
              transition-all duration-100
              flex-shrink-0
            "
            style={{ borderRadius: '4px' }}
            aria-label="Go back"
          >
            &larr;
          </button>
        )}
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-pixel)] text-[13px] text-near-black truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="font-[family-name:var(--font-hand)] text-base text-near-black truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {rightAction && (
        <div className="flex-shrink-0 ml-3">
          {rightAction}
        </div>
      )}
    </header>
  );
}
