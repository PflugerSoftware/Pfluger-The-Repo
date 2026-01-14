import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, ArrowRight, Users, Building, MapPin, Calendar } from 'lucide-react';
import type { CaseStudyCardData, CaseStudy } from './types';
import { getStorageUrl } from '../../config/storage';

interface CaseStudyCardBlockProps {
  data: CaseStudyCardData;
}

function CaseStudyModal({ study, onClose }: { study: CaseStudy; onClose: () => void }) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Hero image */}
          <div className="relative h-64 bg-gradient-to-br from-white/5 to-white/10">
            {study.image && (
              <img
                src={getStorageUrl(study.image)}
                alt={study.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="px-8 pb-8 -mt-16 relative">
            {/* Header */}
            <div className="mb-6">
              {study.year && (
                <p className="text-sky-400 text-sm font-medium mb-2">{study.year}</p>
              )}
              <h2 className="text-3xl font-bold text-white mb-2">{study.title}</h2>
              <p className="text-lg text-gray-400">{study.subtitle}</p>
            </div>

            {/* Quick facts bar */}
            <div className="flex flex-wrap gap-6 py-4 mb-6 border-y border-white/10">
              {study.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-300">{study.location}</span>
                </div>
              )}
              {study.architect && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-300">{study.architect}</span>
                </div>
              )}
              {study.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-300">Completed {study.year}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {study.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content - 2 cols */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                    Overview
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{study.description}</p>
                </div>

                {/* Building Features */}
                {study.buildingType && study.buildingType.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                      Building Specifications
                    </h3>
                    <div className="space-y-2">
                      {study.buildingType.map((type, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 bg-white/5 rounded-xl"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategies */}
                {study.strategies && study.strategies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                      Key Strategies & Impact
                    </h3>
                    <div className="space-y-3">
                      {study.strategies.map((strategy, i) => (
                        <div
                          key={i}
                          className="p-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl border-l-2 border-emerald-500"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">{strategy.name}</span>
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">
                              <ArrowRight className="w-3 h-3" />
                              {strategy.impact}
                            </span>
                          </div>
                          {strategy.description && (
                            <p className="text-sm text-gray-500">{strategy.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - 1 col */}
              <div className="space-y-6">
                {/* Metrics */}
                {study.metrics && study.metrics.length > 0 && (
                  <div className="p-5 bg-white/5 rounded-2xl">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                      Key Metrics
                    </h3>
                    <div className="space-y-4">
                      {study.metrics.map((metric, i) => (
                        <div key={i}>
                          <p className="text-2xl font-bold text-white">{metric.value}</p>
                          <p className="text-xs text-gray-500">{metric.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Team */}
                {study.team && study.team.length > 0 && (
                  <div className="p-5 bg-white/5 rounded-2xl">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                      <Users className="w-4 h-4 inline mr-2" />
                      Project Team
                    </h3>
                    <div className="space-y-3">
                      {study.team.map((member, i) => (
                        <div key={i}>
                          <p className="text-xs text-gray-500">{member.role}</p>
                          <p className="text-sm text-white">{member.company}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Awards */}
                {study.awards && study.awards.length > 0 && (
                  <div className="p-5 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl border border-amber-500/20">
                    <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
                      <Award className="w-4 h-4 inline mr-2" />
                      Awards
                    </h3>
                    <div className="space-y-2">
                      {study.awards.map((award, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-sm text-amber-200/80"
                        >
                          <Award className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
                          {award}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CaseStudyCardBlock({ data }: CaseStudyCardBlockProps) {
  const { studies } = data;
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);

  return (
    <>
      {/* Horizontal scroll container - extends to right edge for peek effect */}
      <div className="relative">
        {/* Gradient fade on right edge to hint at more content */}
        <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-[#121212] to-transparent z-10 pointer-events-none" />
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-24">
          {studies.map((study, index) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-72 snap-start text-center"
            >
              {/* Image area */}
              <div
                className="relative h-56 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl overflow-hidden cursor-pointer group mb-5"
                onClick={() => setSelectedStudy(study)}
              >
                {study.image && (
                  <img
                    src={getStorageUrl(study.image)}
                    alt={study.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>

              {/* Content - minimal */}
              <div className="space-y-2">
                {/* Year - always show space for alignment */}
                <p className={`text-sm h-5 ${study.year ? 'text-sky-400' : 'text-gray-700'}`}>
                  {study.year || 'Research needed'}
                </p>
                <h3 className="text-xl font-semibold text-white">{study.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{study.subtitle}</p>

                {/* Location - always show space for alignment */}
                <p className={`text-sm h-5 ${study.location ? 'text-gray-400' : 'text-gray-700'}`}>
                  {study.location || 'Location TBD'}
                </p>

                {/* Button */}
                <div className="pt-3">
                  <button
                    onClick={() => setSelectedStudy(study)}
                    className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-full transition-colors"
                  >
                    Learn more
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal - rendered via portal to escape overflow containers */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedStudy && (
            <CaseStudyModal
              study={selectedStudy}
              onClose={() => setSelectedStudy(null)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
