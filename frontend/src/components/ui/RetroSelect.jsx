import { forwardRef } from 'react';

/**
 * RetroSelect — Thick-bordered select dropdown.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.placeholder]
 * @param {{ value: string, label: string }[]} props.options
 * @param {boolean} [props.fullWidth=true]
 */
const RetroSelect = forwardRef(function RetroSelect(
  {
    label,
    error,
    placeholder,
    options = [],
    fullWidth = true,
    className = '',
    id,
    ...rest
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block font-[family-name:var(--font-hand)] text-lg font-bold text-near-black mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full appearance-none
            font-[family-name:var(--font-hand)] text-lg
            bg-cream-light text-near-black
            border-3 rounded-retro
            shadow-retro-inner
            transition-all duration-150
            focus:outline-none focus:border-retro-cyan focus:shadow-retro-cyan
            min-h-[48px]
            pl-4 pr-10 py-2.5
            cursor-pointer
            ${error ? 'border-danger' : 'border-border-black'}
          `}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-near-black pointer-events-none text-sm">
          ▼
        </span>
      </div>
      {error && (
        <p className="mt-1 text-base text-danger font-[family-name:var(--font-hand)] font-bold">
          ⚠ {error}
        </p>
      )}
    </div>
  );
});

export default RetroSelect;
