import { ChevronLeft } from 'lucide-react';
import type { ProjectConfig } from '../../components/blocks/types';
import { BlockRenderer } from '../../components/blocks';

interface ProjectDashboardProps {
  config: ProjectConfig;
  onBack?: () => void;
}

export default function ProjectDashboard({ config, onBack }: ProjectDashboardProps) {
  return (
    <div className="min-h-screen overflow-x-clip">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/60 backdrop-blur-md">
        <div className="relative max-w-5xl mx-auto px-12 py-6">
          {/* Back button in margin */}
          {onBack && (
            <button
              onClick={onBack}
              className="absolute -left-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-9 h-9" />
            </button>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight font-mono">
                {config.code}
              </h1>
              <p className="text-xl text-gray-300 mt-1">{config.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Researcher</p>
              <p className="text-lg text-white">{config.researcher}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content - All blocks scroll */}
      <main className="py-8">
        {config.blocks.map((block) => {
          // Full-bleed blocks render without container constraints
          const isFullBleed = block.type === 'image-gallery';
          // Extended blocks need overflow visible for peek effect
          const isExtended = block.type === 'case-study-card';

          if (isFullBleed) {
            return (
              <div key={block.id} className="mb-8">
                {(block.title || block.description) && (
                  <div className="max-w-5xl mx-auto px-12 mb-6">
                    {block.title && <h3 className="text-xl font-bold text-white mb-1">{block.title}</h3>}
                    {block.description && <p className="text-gray-500">{block.description}</p>}
                  </div>
                )}
                <BlockRenderer block={block} />
              </div>
            );
          }

          if (isExtended) {
            return (
              <div key={block.id} className="mb-8">
                {(block.title || block.description) && (
                  <div className="max-w-5xl mx-auto px-12 mb-6">
                    {block.title && <h3 className="text-xl font-bold text-white mb-1">{block.title}</h3>}
                    {block.description && <p className="text-gray-500">{block.description}</p>}
                  </div>
                )}
                {/* Left-aligned with padding, extends to right edge */}
                <div className="pl-12 lg:pl-[calc((100vw-64rem)/2+3rem)]">
                  <BlockRenderer block={block} />
                </div>
              </div>
            );
          }

          // Add extra top margin for section blocks
          const isSection = block.type === 'section';

          return (
            <div key={block.id} className={`max-w-5xl mx-auto px-12 ${isSection ? 'mt-24 first:mt-0' : ''}`}>
              <BlockRenderer block={block} />
            </div>
          );
        })}
      </main>
    </div>
  );
}
