/**
 * RetroCard — Rounded card with thick border and offset shadow.
 *
 * @param {object} props
 * @param {'default'|'pink'|'cyan'|'yellow'|'purple'|'green'|'orange'} [props.variant='default']
 * @param {boolean} [props.hover=false] - Enable hover lift effect
 * @param {boolean} [props.noPadding=false]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function RetroCard({
  variant = 'default',
  hover = false,
  noPadding = false,
  className = '',
  children,
  ...rest
}) {
  const variantStyles = {
    default: 'bg-cream-light',
    pink: 'bg-retro-pink-bg',
    cyan: 'bg-retro-cyan-bg',
    yellow: 'bg-retro-yellow-bg',
    purple: 'bg-retro-purple-bg',
    green: 'bg-retro-green-bg',
    orange: 'bg-retro-orange-bg',
  };

  return (
    <div
      className={`
        border-3 border-border-black
        rounded-retro-lg
        shadow-retro
        ${variantStyles[variant] || variantStyles.default}
        ${!noPadding ? 'p-4' : ''}
        ${hover ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-retro-lg cursor-pointer' : ''}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}
