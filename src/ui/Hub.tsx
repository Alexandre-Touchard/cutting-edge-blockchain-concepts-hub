import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  Database,
  GitBranch,
  Layers,
  Lock,
  Search,
  Shield,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

export type CategoryId = 'all' | 'consensus' | 'scaling' | 'execution' | 'data' | 'interop' | 'security' | 'defi';

export type DemoMeta = {
  id: string;
  title: string;
  category: Exclude<CategoryId, 'all'>;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  description: string;
  concepts: string[];
  keyTakeaways: string[];
  tags: string[];
};

export default function Hub({
  demos,
  onOpenDemo
}: {
  demos: DemoMeta[];
  onOpenDemo: (demo: DemoMeta) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredThumbnailDemoId, setHoveredThumbnailDemoId] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      ({
        all: { name: 'All Demos', icon: Layers, colorKey: 'blue' },
        consensus: { name: 'Consensus & Validation', icon: Shield, colorKey: 'emerald' },
        scaling: { name: 'Layer 2 & Scaling', icon: Zap, colorKey: 'purple' },
        execution: { name: 'Execution & Performance', icon: TrendingUp, colorKey: 'yellow' },
        data: { name: 'Data Availability', icon: Database, colorKey: 'cyan' },
        interop: { name: 'Cross-Chain & Bridges', icon: GitBranch, colorKey: 'pink' },
        security: { name: 'Security & Cryptography', icon: Lock, colorKey: 'red' },
        defi: { name: 'DeFi Mechanisms', icon: Users, colorKey: 'green' }
      }) as const,
    []
  );

  const colorStyles = useMemo(
    () =>
      ({
        blue: {
          selected: 'border-blue-500 bg-blue-500/20 text-blue-300',
          countSelected: 'bg-blue-600',
          thumb: 'from-blue-900 to-slate-900',
          tag: 'bg-blue-900/30 text-blue-300 border-blue-700'
        },
        emerald: {
          selected: 'border-emerald-500 bg-emerald-500/20 text-emerald-300',
          countSelected: 'bg-emerald-600',
          thumb: 'from-emerald-900 to-slate-900',
          tag: 'bg-emerald-900/30 text-emerald-300 border-emerald-700'
        },
        purple: {
          selected: 'border-purple-500 bg-purple-500/20 text-purple-300',
          countSelected: 'bg-purple-600',
          thumb: 'from-purple-900 to-slate-900',
          tag: 'bg-purple-900/30 text-purple-300 border-purple-700'
        },
        yellow: {
          selected: 'border-yellow-500 bg-yellow-500/20 text-yellow-300',
          countSelected: 'bg-yellow-600',
          thumb: 'from-yellow-900 to-slate-900',
          tag: 'bg-yellow-900/30 text-yellow-300 border-yellow-700'
        },
        cyan: {
          selected: 'border-cyan-500 bg-cyan-500/20 text-cyan-300',
          countSelected: 'bg-cyan-600',
          thumb: 'from-cyan-900 to-slate-900',
          tag: 'bg-cyan-900/30 text-cyan-300 border-cyan-700'
        },
        pink: {
          selected: 'border-pink-500 bg-pink-500/20 text-pink-300',
          countSelected: 'bg-pink-600',
          thumb: 'from-pink-900 to-slate-900',
          tag: 'bg-pink-900/30 text-pink-300 border-pink-700'
        },
        red: {
          selected: 'border-red-500 bg-red-500/20 text-red-300',
          countSelected: 'bg-red-600',
          thumb: 'from-red-900 to-slate-900',
          tag: 'bg-red-900/30 text-red-300 border-red-700'
        },
        green: {
          selected: 'border-green-500 bg-green-500/20 text-green-300',
          countSelected: 'bg-green-600',
          thumb: 'from-green-900 to-slate-900',
          tag: 'bg-green-900/30 text-green-300 border-green-700'
        }
      }) as const,
    []
  );

  const filteredDemos = demos.filter((demo) => {
    const matchesCategory = selectedCategory === 'all' || demo.category === selectedCategory;
    const matchesSearch =
      demo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demo.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: DemoMeta['difficulty']) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-600';
      case 'Intermediate':
        return 'bg-yellow-600';
      case 'Advanced':
        return 'bg-red-600';
      default:
        return 'bg-slate-600';
    }
  };

  const getCategoryColorKey = (category: DemoMeta['category']) => {
    return categories[category]?.colorKey ?? 'blue';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Blockchain Learning Hub
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Interactive demonstrations of cutting-edge blockchain concepts, protocols, and mechanisms
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="px-4 py-2 bg-slate-800 rounded-full text-sm">
              <span className="text-slate-400">Total Demos:</span>{' '}
              <span className="font-bold text-blue-400">{demos.length}</span>
            </div>
            <div className="px-4 py-2 bg-slate-800 rounded-full text-sm">
              <span className="text-slate-400">Categories:</span>{' '}
              <span className="font-bold text-purple-400">{Object.keys(categories).length - 1}</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search demos, concepts, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(categories).map(([key, category]) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as CategoryId)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    isSelected
                      ? colorStyles[category.colorKey].selected
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-semibold">{category.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected ? colorStyles[category.colorKey].countSelected : 'bg-slate-700'
                    }`}
                  >
                    {demos.filter((d) => key === 'all' || d.category === key).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-slate-400">
          Showing {filteredDemos.length} of {demos.length} demos{searchTerm && ` for "${searchTerm}"`}
        </div>

        {/* Demos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDemos.map((demo) => {
            const categoryColorKey = getCategoryColorKey(demo.category);
            const categoryStyle = colorStyles[categoryColorKey];
            return (
              <div
                key={demo.id}
                onClick={() => onOpenDemo(demo)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onOpenDemo(demo);
                }}
                role="button"
                tabIndex={0}
                className="group relative bg-slate-800 rounded-xl border-2 border-slate-700 hover:border-blue-500 transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {/* Thumbnail */}
                <div
                  onMouseEnter={() => setHoveredThumbnailDemoId(demo.id)}
                  onMouseLeave={() => setHoveredThumbnailDemoId(null)}
                  className={`h-32 bg-gradient-to-br ${categoryStyle.thumb} flex items-center justify-center relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-50"></div>
                  <div className="text-6xl relative z-10 group-hover:scale-110 transition-transform">
                    {demo.thumbnail}
                  </div>
                  <div
                    className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(
                      demo.difficulty
                    )}`}
                  >
                    {demo.difficulty}
                  </div>

                  {/* Key Takeaways (thumbnail hover) */}
                  {hoveredThumbnailDemoId === demo.id && demo.keyTakeaways.length > 0 && (
                    <div className="absolute left-0 right-0 bottom-0 z-20 bg-slate-950/95 p-4 border-t-2 border-blue-500">
                      <div className="text-xs font-semibold text-blue-400 mb-2">Key Takeaways:</div>
                      <ul className="space-y-1">
                        {demo.keyTakeaways.slice(0, 3).map((takeaway, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <span className="line-clamp-2">{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                    {demo.title}
                  </h3>

                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{demo.description}</p>

                  {/* Concepts */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-slate-500 mb-2">Key Concepts:</div>
                    <div className="flex flex-wrap gap-1">
                      {demo.concepts.slice(0, 3).map((concept) => (
                        <span key={concept} className="text-xs px-2 py-1 bg-slate-700 rounded">
                          {concept}
                        </span>
                      ))}
                      {demo.concepts.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-400">
                          +{demo.concepts.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {demo.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-1 rounded-full border ${categoryStyle.tag}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* View Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDemo(demo);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    View Details
                    <ChevronRight size={16} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredDemos.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No demos found</h3>
            <p className="text-slate-400">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Author Footer */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-slate-400">Created by</span>
            <span className="font-semibold text-white">Alexandre Touchard</span>
          </div>
          <a
            href="https://www.linkedin.com/in/alexandre-touchard-577b3baa/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-semibold"
          >
            <span className="font-bold">in</span>
            Connect on LinkedIn
          </a>
          <p className="text-xs text-slate-500 mt-4">© 2026 Alexandre Touchard. Interactive blockchain education demos.</p>
        </div>
      </div>
    </div>
  );
}
