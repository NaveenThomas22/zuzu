/**
 * EmptyState — Friendly empty-state display using custom pixel art.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.icon] - Icon component
 * @param {string} props.title - Main message
 * @param {string} [props.description] - Secondary description
 * @param {React.ReactNode} [props.action] - Optional action button
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-12 px-6
        text-center
        animate-fade-in
        ${className}
      `}
    >
      {/* Icon illustration */}
      {icon && (
        <div className="mb-4 animate-float text-near-black">
          {icon}
        </div>
      )}

      {/* Sticker-note style message */}
      <div className="
        bg-retro-yellow-bg
        border-[3px] border-border-black
        rounded-retro
        shadow-retro-sm
        px-6 py-4
        max-w-[280px]
        transform -rotate-1
      ">
        <h3 className="font-[family-name:var(--font-pixel)] text-[10px] text-near-black mb-2 leading-relaxed">
          {title}
        </h3>
        {description && (
          <p className="font-[family-name:var(--font-hand)] text-lg text-dark-gray">
            {description}
          </p>
        )}
      </div>

      {/* Optional action */}
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}
