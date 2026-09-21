/**
 * RetroBadge — Small label badge with retro colors.
 *
 * @param {object} props
 * @param {'pink'|'cyan'|'yellow'|'green'|'purple'|'orange'|'danger'|'neutral'} [props.variant='neutral']
 * @param {'sm'|'md'} [props.size='md']
 * @param {React.ReactNode} props.children
 */
export default function RetroBadge({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}) {
  const variantStyles = {
    pink: 'bg-retro-pink-bg text-retro-pink-dark border-retro-pink',
    cyan: 'bg-retro-cyan-bg text-retro-cyan-dark border-retro-cyan',
    yellow: 'bg-retro-yellow-bg text-retro-yellow-dark border-retro-yellow',
    green: 'bg-retro-green-bg text-retro-green-dark border-retro-green',
    purple: 'bg-retro-purple-bg text-retro-purple-dark border-retro-purple',
    orange: 'bg-retro-orange-bg text-retro-orange-dark border-retro-orange',
    danger: 'bg-danger-bg text-danger border-danger',
    neutral: 'bg-cream-dark text-dark-gray border-light-gray',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-sm',
    md: 'px-3 py-1 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-[family-name:var(--font-hand)] font-bold
        border-2 rounded-retro-full
        whitespace-nowrap
        ${variantStyles[variant] || variantStyles.neutral}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
