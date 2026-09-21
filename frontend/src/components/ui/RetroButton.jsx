/**
 * RetroButton — Thick-bordered, offset-shadow tactile button.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'accent'|'danger'|'ghost'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.fullWidth=false]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.loading=false]
 * @param {React.ReactNode} [props.icon]
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {React.ReactNode} props.children
 */
export default function RetroButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  type = 'button',
  children,
  className = '',
  ...rest
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-[family-name:var(--font-hand)] font-bold
    border-3 border-border-black
    rounded-retro
    transition-all duration-150 ease-out
    select-none
    active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-pressed
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-retro
  `;

  const variantStyles = {
    primary: 'bg-retro-pink text-near-black shadow-retro hover:bg-retro-pink-dark hover:shadow-retro-hover',
    secondary: 'bg-retro-cyan text-near-black shadow-retro hover:bg-retro-cyan-dark hover:shadow-retro-hover',
    accent: 'bg-retro-yellow text-near-black shadow-retro hover:bg-retro-yellow-dark hover:shadow-retro-hover',
    danger: 'bg-danger text-white shadow-retro hover:opacity-90 hover:shadow-retro-hover',
    ghost: 'bg-transparent text-near-black border-2 border-border-black shadow-none hover:bg-cream-dark',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-base min-h-[36px]',
    md: 'px-5 py-2.5 text-lg min-h-[46px]',
    lg: 'px-7 py-3 text-xl min-h-[54px]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin-slow" />
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0 text-xl">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
