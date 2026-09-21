import { forwardRef } from 'react';

/**
 * RetroInput — Thick-bordered input with label and error state.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {React.ReactNode} [props.icon] - Left icon
 * @param {React.ReactNode} [props.rightIcon] - Right icon/action
 * @param {boolean} [props.fullWidth=true]
 * @param {string} [props.className]
 */
const RetroInput = forwardRef(function RetroInput(
  {
    label,
    error,
    icon,
    rightIcon,
    fullWidth = true,
    className = '',
    id,
    ...rest
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block font-[family-name:var(--font-hand)] text-lg font-bold text-near-black mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-medium-gray pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full
            font-[family-name:var(--font-hand)] text-lg
            bg-cream-light text-near-black
            border-3 rounded-retro
            shadow-retro-inner
            placeholder:text-light-gray
            transition-all duration-150
            focus:outline-none focus:border-retro-cyan focus:shadow-retro-cyan
            min-h-[48px]
            ${icon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            py-2.5
            ${error ? 'border-danger' : 'border-border-black'}
          `}
          {...rest}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-medium-gray">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-base text-danger font-[family-name:var(--font-hand)] font-bold">
          ⚠ {error}
        </p>
      )}
    </div>
  );
});

export default RetroInput;
