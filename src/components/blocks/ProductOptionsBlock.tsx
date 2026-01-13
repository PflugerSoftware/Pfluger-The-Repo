import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductOptionsData, ProductLine } from './types';
import { getStorageUrl } from '../../config/storage';

interface ProductOptionsBlockProps {
  data: ProductOptionsData;
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${Math.round(price / 1000)}K`;
  }
  return `$${price.toLocaleString()}`;
}

function ProductLineCard({ line, index }: { line: ProductLine; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { name, subtitle, image, options } = line;

  // Sort options by price (lowest first for display)
  const sortedOptions = [...options].sort((a, b) => a.price - b.price);
  const minPrice = sortedOptions[0]?.price || 0;
  const maxPrice = sortedOptions[sortedOptions.length - 1]?.price || 0;

  const selectedOption = selectedIndex !== null ? sortedOptions[selectedIndex] : null;

  return (
    <motion.div
      className="overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {/* Collapsed view - Apple style */}
      <div className="p-6 text-center">
        {/* Product image */}
        {image && (
          <div className="mb-4 flex justify-center">
            <img
              src={getStorageUrl(image)}
              alt={name}
              className="w-28 h-28 object-cover rounded-2xl"
            />
          </div>
        )}

        {/* Company name */}
        {subtitle && <h4 className="text-lg font-semibold text-white mb-1">{subtitle}</h4>}

        {/* Product line / Selected option name */}
        <p className="text-sm text-gray-400 mb-4">
          {selectedOption ? selectedOption.name : name}
        </p>

        {/* Option dots */}
        <div className="flex justify-center gap-2 mb-4">
          {sortedOptions.map((option, i) => (
            <button
              key={option.name}
              className={`w-3 h-3 rounded-full transition-all hover:scale-125 ${
                selectedIndex === i ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121212] scale-125' : ''
              }`}
              style={{ backgroundColor: option.color }}
              title={`${option.name} - ${formatPrice(option.price)}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(selectedIndex === i ? null : i);
              }}
            />
          ))}
        </div>

        {/* Price display - range or selected */}
        <div className="mb-2">
          {selectedOption ? (
            <p className="text-sm">
              <span className="font-semibold text-white">{formatPrice(selectedOption.price)}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-300">
              {minPrice === maxPrice ? (
                <span className="font-medium">{formatPrice(minPrice)}</span>
              ) : (
                <>
                  From <span className="font-medium">{formatPrice(minPrice)}</span>
                  {' to '}
                  <span className="font-medium">{formatPrice(maxPrice)}</span>
                </>
              )}
            </p>
          )}
        </div>

        {/* Selected option specs */}
        {selectedOption && selectedOption.specs && selectedOption.specs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-2"
          >
            {selectedOption.specs.map(spec => (
              <span key={spec.label} className="text-xs text-gray-500">
                {spec.label}: <span className="text-gray-400">{spec.value}</span>
              </span>
            ))}
          </motion.div>
        )}

        {/* Expand hint */}
        <motion.div
          className="mt-4 text-gray-600 cursor-pointer"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setExpanded(!expanded)}
        >
          <svg className="mx-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.div>
      </div>

      {/* Expanded comparison view */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-4 space-y-3">
              {/* Options comparison */}
              {sortedOptions.map((option, optIndex) => (
                <motion.div
                  key={option.name}
                  className="p-3 rounded-xl bg-white/5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: optIndex * 0.05 }}
                >
                  {/* Option header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="text-sm font-medium text-white">{option.name}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: option.color }}>
                      {formatPrice(option.price)}
                    </span>
                  </div>

                  {/* Specs */}
                  {option.specs && option.specs.length > 0 && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                      {option.specs.map(spec => (
                        <span key={spec.label} className="text-xs text-gray-500">
                          {spec.label}: <span className="text-gray-400">{spec.value}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Cost breakdown bar */}
                  {option.costs && option.costs.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
                        {option.costs.map((cost, i) => (
                          <div
                            key={cost.label}
                            className="h-full"
                            style={{
                              width: `${cost.value}%`,
                              backgroundColor: cost.color,
                              marginLeft: i > 0 ? '1px' : 0,
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-3">
                        {option.costs.map(cost => {
                          const dollarValue = Math.round(option.price * cost.value / 100);
                          return (
                            <span key={cost.label} className="text-[10px]" style={{ color: cost.color }}>
                              {cost.label} {formatPrice(dollarValue)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ProductOptionsBlock({ data }: ProductOptionsBlockProps) {
  const { lines, columns = 3 } = data;

  const gridCols: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {lines.map((line, index) => (
        <ProductLineCard key={line.name} line={line} index={index} />
      ))}
    </div>
  );
}
