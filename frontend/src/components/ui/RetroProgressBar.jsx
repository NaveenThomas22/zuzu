/**
 * RetroProgressBar — Thick-bordered progress bar with retro fill.
 *
 * @param {object} props
 * @param {number} props.value - 0 to 100
 * @param {'pink'|'cyan'|'green'|'yellow'|'purple'|'orange'|'danger'} [props.color='cyan']
 * @param {boolean} [props.showLabel=true]
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.label] - Custom label instead of percentage
 */
export default function RetroProgressBar({
  value = 0,
  color = 'cyan',
  showLabel = true,
  size = 'md',
  label,
  className = '',
}) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colorMap = {
    pink: 'bg-retro-pink',
    cyan: 'bg-retro-cyan',
    green: 'bg-retro-green',
    yellow: 'bg-retro-yellow',
    purple: 'bg-retro-purple',
    orange: 'bg-retro-orange',
    danger: 'bg-danger',
  };

  const sizeMap = {
    sm: 'h-3',
    md: 'h-5',
    lg: 'h-7',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="font-[family-name:var(--font-hand)] text-base text-dark-gray font-bold">
            {label || `${Math.round(clampedValue)}%`}
          </span>
        </div>
      )}
      <div
        className={`
          w-full bg-cream-dark
          border-2 border-border-black
          rounded-retro-full
          overflow-hidden
          ${sizeMap[size] || sizeMap.md}
        `}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`
            ${sizeMap[size] || sizeMap.md}
            ${colorMap[color] || colorMap.cyan}
            rounded-retro-full
            transition-all duration-500 ease-out
          `}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
