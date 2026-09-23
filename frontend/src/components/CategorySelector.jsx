import React from 'react';
import PixelIcon from './PixelIcon';

// Consistent pastel accents for categories
const CATEGORY_COLORS = {
  'bills': '#FFD54F', // yellow
  'clothing': '#F48FB1', // pink
  'entertainment': '#CE93D8', // purple
  'financial': '#A5D6A7', // green
  'fitness': '#80DEEA', // cyan
  'food': '#FFCC80', // orange-ish
  'housing & living': '#A5D6A7', // green
  'other': '#CE93D8', // purple
  'self care': '#F48FB1', // pink
  'travel': '#80DEEA', // cyan
  'unhealthy habits': '#FFAB91', // warm
};

const getCategoryColor = (name) => {
  const norm = name?.toLowerCase() || '';
  return CATEGORY_COLORS[norm] || '#80DEEA';
};

function getCategoryIcon(category) {
  const icon = category.icon || category.name?.toLowerCase().replace(/\s+/g, '-');
  return icon || 'other';
}

// Hardcoded decorative pixels to prevent re-render jumps
const DECORATIONS = [
  // Desktop specific / general (8 decorations)
  { id: 'd1', top: '-18px', left: '10%', type: 'deco-star-large', color: '#FFD54F', size: 32 },
  { id: 'd2', top: '10%', right: '-20px', type: 'deco-diamond', color: '#F48FB1', size: 32 },
  { id: 'd3', bottom: '15%', left: '-25px', type: 'deco-8bit-star', color: '#80DEEA', size: 32 },
  { id: 'd4', bottom: '-20px', right: '15%', type: 'deco-burst', color: '#CE93D8', size: 32 },
  { id: 'd5', top: '45%', left: '45%', type: 'deco-cross', color: '#A5D6A7', size: 32 },
  { id: 'd6', top: '-10px', right: '35%', type: 'deco-star-small', color: '#80DEEA', size: 32 },
  { id: 'd7', bottom: '5%', right: '45%', type: 'deco-heart-sparkle', color: '#F48FB1', size: 32 },
  { id: 'd8', top: '25%', right: '10%', type: 'deco-cluster', color: '#FFD54F', size: 32 },
];

const CARD_DECORATIONS = {
  'bills': { type: 'deco-star-small', color: '#FFD54F', className: 'top-[-8px] right-[-8px]' },
  'food': { type: 'deco-cross', color: '#80DEEA', className: 'bottom-[-6px] left-[-6px]' },
  'self care': { type: 'deco-heart-sparkle', color: '#F48FB1', className: 'top-[-10px] left-[-4px]' },
  'entertainment': { type: 'deco-diamond', color: '#CE93D8', className: 'bottom-[-8px] right-[-4px]' },
};

export default function CategorySelector({ categories, selectedId, onSelect, onClear }) {
  if (!categories || categories.length === 0) {
    return (
      <p className="font-retro text-sm text-ink/60 text-center py-4 border-[3px] border-ink border-dashed">
        No categories found.
      </p>
    );
  }

  return (
    <div className="relative w-full mt-6 mb-4">
      
      {/* Decorative Layer */}
      <div className="absolute inset-0 pointer-events-none -m-4 z-0">
        {DECORATIONS.map(d => (
          <div 
            key={d.id}
            className="absolute hidden sm:block"
            style={{
              top: d.top,
              left: d.left,
              right: d.right,
              bottom: d.bottom,
            }}
          >
            <PixelIcon name={d.type} size={d.size} accent={d.color} />
          </div>
        ))}
        {/* Mobile specific decorations (reduced to 5 items) */}
        {DECORATIONS.slice(0, 5).map(d => (
          <div 
            key={`${d.id}-mob`}
            className="absolute sm:hidden"
            style={{
              top: d.top,
              left: d.left,
              right: d.right,
              bottom: d.bottom,
            }}
          >
            <PixelIcon name={d.type} size={d.size} accent={d.color} />
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10 px-1 py-1">
        {categories.map(c => {
          const iconName = getCategoryIcon(c);
          const isSelected = selectedId === c.id;
          const accentColor = getCategoryColor(c.name);
          const normName = c.name?.toLowerCase();
          const cardDeco = CARD_DECORATIONS[normName];
          
          return (
            <div key={c.id} className="relative">
              <button 
                onClick={() => onSelect(c.id)}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 gap-2 border-[3px] border-ink w-full h-full ${isSelected ? 'bg-cream translate-y-[4px] shadow-none' : 'bg-cream hover:-translate-y-[1px] hover:bg-cream/80'}`}
                style={!isSelected ? { boxShadow: '4px 4px 0 #1A1A1A' } : {}}
              >
                <PixelIcon 
                  name={iconName} 
                  size={32} 
                  accent={isSelected ? '#1A1A1A' : accentColor} 
                />
                <span className="font-pixel text-[10px] uppercase text-center break-words leading-tight mt-1">
                  {c.name}
                </span>
              </button>
              
              {/* Card-specific tiny decoration */}
              {cardDeco && (
                <div className={`absolute pointer-events-none z-20 ${cardDeco.className}`}>
                  <PixelIcon name={cardDeco.type} size={24} accent={cardDeco.color} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
