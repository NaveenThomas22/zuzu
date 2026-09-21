/**
 * RetroTabs — Thick-bordered tab group (like Expense/Income, Active/Settled).
 *
 * @param {object} props
 * @param {{ value: string, label: string }[]} props.tabs
 * @param {string} props.activeTab
 * @param {(value: string) => void} props.onChange
 * @param {'pink'|'cyan'|'yellow'} [props.activeColor='pink']
 */
export default function RetroTabs({
  tabs = [],
  activeTab,
  onChange,
  activeColor = 'pink',
  className = '',
}) {
  const colorMap = {
    pink: 'bg-retro-pink',
    cyan: 'bg-retro-cyan',
    yellow: 'bg-retro-yellow',
  };

  return (
    <div
      className={`
        inline-flex
        border-3 border-border-black
        rounded-retro
        overflow-hidden
        shadow-retro-sm
        bg-cream-light
        ${className}
      `}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`
              px-5 py-2.5
              font-[family-name:var(--font-hand)] text-lg font-bold
              transition-all duration-150
              min-h-[42px]
              border-r-2 border-border-black last:border-r-0
              ${isActive
                ? `${colorMap[activeColor] || colorMap.pink} text-near-black`
                : 'bg-transparent text-dark-gray hover:bg-cream-dark'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
