import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import type { SurveyRatingData } from './types';

interface SurveyRatingBlockProps {
  data: SurveyRatingData;
}

const defaultLabels: Record<number, string> = {
  5: 'Very Excited',
  4: 'Somewhat Excited',
  3: 'Neutral',
  2: 'Somewhat Displeased',
  1: 'Very Displeased',
};

const ratingColors: Record<number, string> = {
  5: '#10b981',
  4: '#34d399',
  3: '#fbbf24',
  2: '#f97316',
  1: '#ef4444',
};

function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const rounded = useTransform(spring, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  useEffect(() => {
    return rounded.on('change', (v) => setDisplayValue(parseFloat(v)));
  }, [rounded]);

  return <span ref={ref}>{displayValue.toFixed(decimals)}</span>;
}

export function SurveyRatingBlock({ data }: SurveyRatingBlockProps) {
  const { title, totalResponses, ratings, averageRating, color } = data;
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const maxCount = Math.max(...ratings.map(r => r.count));
  const sortedRatings = [...ratings].sort((a, b) => b.rating - a.rating);
  const calculatedAverage = averageRating ?? (
    sortedRatings.reduce((sum, r) => sum + (r.rating * r.count), 0) / totalResponses
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      className="w-full"
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color || '#3b82f6'}20` }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Star className="w-5 h-5" style={{ color: color || '#3b82f6' }} />
          </motion.div>
          <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm text-gray-400">{totalResponses} responses</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">
            <AnimatedNumber value={calculatedAverage} />
          </p>
          <p className="text-xs text-gray-400">avg rating</p>
        </div>
      </motion.div>

      {/* Rating Bars */}
      <div className="space-y-3">
        {sortedRatings.map((item, index) => {
          const percentage = (item.count / maxCount) * 100;
          const responsePercentage = ((item.count / totalResponses) * 100).toFixed(0);
          const barColor = color || ratingColors[item.rating] || '#3b82f6';

          return (
            <motion.div
              key={item.rating}
              variants={itemVariants}
              className="group"
            >
              <motion.div
                className="flex items-center gap-4"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* Rating number */}
                <div className="flex items-center gap-1 w-8">
                  <span className="text-white font-semibold">{item.rating}</span>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Star className="w-3 h-3 text-gray-500 group-hover:text-yellow-400 transition-colors" fill="currentColor" />
                  </motion.div>
                </div>

                {/* Bar container */}
                <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative group-hover:bg-white/10 transition-colors">
                  <motion.div
                    className="h-full rounded-lg"
                    style={{ backgroundColor: barColor }}
                    initial={{ width: 0, opacity: 0 }}
                    animate={isInView ? {
                      width: `${percentage}%`,
                      opacity: 1,
                    } : { width: 0, opacity: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.15 + 0.3,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    whileHover={{ filter: 'brightness(1.2)' }}
                  />

                  {/* Label inside bar */}
                  <motion.div
                    className="absolute inset-0 flex items-center px-3"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: index * 0.15 + 0.5 }}
                  >
                    <span className="text-xs text-white/80 truncate">
                      {item.label || defaultLabels[item.rating]}
                    </span>
                  </motion.div>
                </div>

                {/* Count and percentage */}
                <motion.div
                  className="w-20 text-right"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: index * 0.15 + 0.6 }}
                >
                  <span className="text-white font-medium">{item.count}</span>
                  <span className="text-gray-500 text-sm ml-1">({responsePercentage}%)</span>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
