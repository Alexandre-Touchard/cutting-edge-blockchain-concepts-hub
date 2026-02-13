import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Layers, Zap, Shield, GitBranch, Database, TrendingUp, Lock, Users } from 'lucide-react';

const BlockchainDemosHub = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredDemo, setHoveredDemo] = useState(null);

  const categories = {
    all: { name: 'All Demos', icon: Layers, color: 'blue' },
    consensus: { name: 'Consensus & Validation', icon: Shield, color: 'emerald' },
    scaling: { name: 'Layer 2 & Scaling', icon: Zap, color: 'purple' },
    execution: { name: 'Execution & Performance', icon: TrendingUp, color: 'yellow' },
    data: { name: 'Data Availability', icon: Database, color: 'cyan' },
    interop: { name: 'Cross-Chain & Bridges', icon: GitBranch, color: 'pink' },
    security: { name: 'Security & Cryptography', icon: Lock, color: 'red' },
    defi: { name: 'DeFi Mechanisms', icon: Users, color: 'green' }
  };

  const demos = [
    {
      id: 'parallel-executor',
      title: 'Parallel Transaction Executor',
      category: 'execution',
      difficulty: 'Intermediate',
      thumbnail: '⚡',
      description: 'Compare conservative (Solana) vs optimistic (Aptos Block-STM) parallel execution strategies.',
      concepts: ['Parallel Execution', 'Transaction Ordering', 'Conflict Detection', 'Block-STM'],
      keyTakeaways: [
        'Conservative scheduling avoids wasted work by analyzing dependencies upfront',
        'Optimistic execution maximizes parallelism but may re-execute conflicting transactions',
        'Trade-offs between predictability and throughput'
      ],
      tags: ['Solana', 'Aptos', 'Performance', 'Parallelization']
    },
    {
      id: 'amm-demo',
      title: 'AMM Math & Impermanent Loss',
      category: 'defi',
      difficulty: 'Intermediate',
      thumbnail: '💱',
      description: 'Interactive constant product AMM (x × y = k) with price impact, slippage, and impermanent loss calculations.',
      concepts: ['Constant Product', 'Price Impact', 'Slippage', 'Impermanent Loss', 'Liquidity Provision'],
      keyTakeaways: [
        'x × y = k formula enables automated market making without order books',
        'Price impact increases with trade size relative to pool reserves',
        'Impermanent loss occurs when price ratios change - at 2x price change IL is -5.7%'
      ],
      tags: ['Uniswap', 'DeFi', 'AMM', 'Liquidity']
    },
    {
      id: 'dag-consensus',
      title: 'DAG Consensus (Tangle)',
      category: 'consensus',
      difficulty: 'Advanced',
      thumbnail: '🕸️',
      description: 'Interactive DAG visualization showing how transactions reference tips and achieve consensus without traditional blocks.',
      concepts: ['Directed Acyclic Graph', 'Tip Selection', 'Cumulative Weight', 'Confirmation'],
      keyTakeaways: [
        'No miners needed - users confirm others\' transactions',
        'Parallel transaction processing enables high throughput',
        'Weight accumulation provides probabilistic finality'
      ],
      tags: ['IOTA', 'DAG', 'Feeless', 'Tangle']
    },
    {
      id: 'rollup-simulation',
      title: 'Layer 2 Rollup',
      category: 'scaling',
      difficulty: 'Intermediate',
      thumbnail: '📦',
      description: 'See how L2 transactions are batched and posted to L1 for massive gas savings.',
      concepts: ['Rollups', 'Batching', 'State Roots', 'Data Compression', 'Gas Economics'],
      keyTakeaways: [
        'Bundle hundreds of transactions into a single L1 transaction',
        'Users get instant L2 confirmation with eventual L1 security',
        '10-100x cost reduction compared to direct L1 posting'
      ],
      tags: ['Optimism', 'Arbitrum', 'ZK-Rollups', 'Scaling']
    },
    {
      id: 'eigenlayer-demo',
      title: 'EigenLayer Restaking',
      category: 'security',
      difficulty: 'Advanced',
      thumbnail: '🔄',
      description: 'Reuse ETH stake to secure multiple protocols (AVS) and earn additional rewards.',
      concepts: ['Restaking', 'Shared Security', 'AVS', 'Economic Security', 'Slashing'],
      keyTakeaways: [
        'Capital efficiency - one stake secures multiple services',
        'Earn base staking rewards + additional AVS yields',
        'Higher rewards come with compounded slashing risks'
      ],
      tags: ['EigenLayer', 'Staking', 'Shared Security', 'Ethereum']
    },
    {
      id: 'peerdas-demo',
      title: 'PeerDAS Sampling',
      category: 'data',
      difficulty: 'Advanced',
      thumbnail: '📊',
      description: 'Peer Data Availability Sampling - nodes sample random columns instead of downloading everything.',
      concepts: ['Data Availability', 'Random Sampling', 'Erasure Coding', 'Column Distribution'],
      keyTakeaways: [
        'Nodes store only ~25% of data instead of 100%',
        'Random sampling proves data availability with high confidence',
        'Critical for scaling Ethereum\'s data layer for rollups'
      ],
      tags: ['Ethereum', 'Danksharding', 'Data Availability', 'Sampling']
    },
    {
      id: 'ethereum-blockchain',
      title: 'Minimal Ethereum Blockchain',
      category: 'consensus',
      difficulty: 'Beginner',
      thumbnail: '⛓️',
      description: 'Build a working blockchain from scratch with Proof of Work, accounts, and state transitions.',
      concepts: ['Proof of Work', 'Account Model', 'Mining', 'State Machine', 'Transaction Pool'],
      keyTakeaways: [
        'Blocks link via cryptographic hashes forming an immutable chain',
        'Mining adjusts difficulty to find valid block hashes',
        'Account-based model tracks balances and nonces'
      ],
      tags: ['Blockchain Basics', 'PoW', 'Mining', 'Fundamentals']
    },
    {
      id: 'blockchain-interop',
      title: 'Cross-Chain Protocols',
      category: 'interop',
      difficulty: 'Advanced',
      thumbnail: '🌉',
      description: 'Compare IBC, CCIP, and LayerZero - different trust models for cross-chain messaging.',
      concepts: ['Light Clients', 'Oracle Networks', 'Cross-Chain Messaging', 'Trust Models'],
      keyTakeaways: [
        'IBC uses light clients for trustless verification',
        'CCIP relies on decentralized oracle consensus',
        'LayerZero requires independent Oracle + Relayer agreement'
      ],
      tags: ['IBC', 'Chainlink', 'LayerZero', 'Bridges']
    }
  ];

  const filteredDemos = demos.filter(demo => {
    const matchesCategory = selectedCategory === 'all' || demo.category === selectedCategory;
    const matchesSearch = demo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         demo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         demo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-600';
      case 'Intermediate': return 'bg-yellow-600';
      case 'Advanced': return 'bg-red-600';
      default: return 'bg-slate-600';
    }
  };

  const getCategoryColor = (category) => {
    return categories[category]?.color || 'blue';
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
              <span className="text-slate-400">Total Demos:</span> <span className="font-bold text-blue-400">{demos.length}</span>
            </div>
            <div className="px-4 py-2 bg-slate-800 rounded-full text-sm">
              <span className="text-slate-400">Categories:</span> <span className="font-bold text-purple-400">{Object.keys(categories).length - 1}</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
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
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    isSelected
                      ? `border-${category.color}-500 bg-${category.color}-500 bg-opacity-20 text-${category.color}-300`
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-semibold">{category.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isSelected ? `bg-${category.color}-600` : 'bg-slate-700'
                  }`}>
                    {demos.filter(d => key === 'all' || d.category === key).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-slate-400">
          Showing {filteredDemos.length} of {demos.length} demos
          {searchTerm && ` for "${searchTerm}"`}
        </div>

        {/* Demos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDemos.map(demo => {
            const categoryColor = getCategoryColor(demo.category);
            return (
              <div
                key={demo.id}
                onMouseEnter={() => setHoveredDemo(demo.id)}
                onMouseLeave={() => setHoveredDemo(null)}
                className="group relative bg-slate-800 rounded-xl border-2 border-slate-700 hover:border-blue-500 transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
              >
                {/* Thumbnail */}
                <div className={`h-32 bg-gradient-to-br from-${categoryColor}-900 to-slate-900 flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-50"></div>
                  <div className="text-6xl relative z-10 group-hover:scale-110 transition-transform">
                    {demo.thumbnail}
                  </div>
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(demo.difficulty)}`}>
                    {demo.difficulty}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                    {demo.title}
                  </h3>
                  
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {demo.description}
                  </p>

                  {/* Concepts */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-slate-500 mb-2">Key Concepts:</div>
                    <div className="flex flex-wrap gap-1">
                      {demo.concepts.slice(0, 3).map((concept, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-slate-700 rounded">
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
                    {demo.tags.map((tag, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 bg-${categoryColor}-900 bg-opacity-30 text-${categoryColor}-300 rounded-full border border-${categoryColor}-700`}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* View Button */}
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                    View Demo
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Tooltip on Hover */}
                {hoveredDemo === demo.id && (
                  <div className="absolute left-0 right-0 bottom-0 bg-slate-950 bg-opacity-98 p-5 border-t-2 border-blue-500 transform transition-all duration-300">
                    <div className="text-xs font-semibold text-blue-400 mb-2">Key Takeaways:</div>
                    <ul className="space-y-1">
                      {demo.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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

        {/* Footer Info */}
        <div className="mt-16 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-slate-800 bg-opacity-50 rounded-lg">
              <Layers className="mx-auto mb-3 text-blue-400" size={32} />
              <h4 className="font-semibold mb-2">Interactive Learning</h4>
              <p className="text-sm text-slate-400">
                Hands-on demos with adjustable parameters and real-time visualization
              </p>
            </div>
            <div className="p-6 bg-slate-800 bg-opacity-50 rounded-lg">
              <Zap className="mx-auto mb-3 text-purple-400" size={32} />
              <h4 className="font-semibold mb-2">Cutting-Edge Tech</h4>
              <p className="text-sm text-slate-400">
                Explore the latest innovations in blockchain scalability and security
              </p>
            </div>
            <div className="p-6 bg-slate-800 bg-opacity-50 rounded-lg">
              <TrendingUp className="mx-auto mb-3 text-emerald-400" size={32} />
              <h4 className="font-semibold mb-2">Progressive Difficulty</h4>
              <p className="text-sm text-slate-400">
                Start with basics and advance to complex protocol mechanics
              </p>
            </div>
          </div>
        </div>

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
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Connect on LinkedIn
          </a>
          <p className="text-xs text-slate-500 mt-4">
            © 2026 Alexandre Touchard. Interactive blockchain education demos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlockchainDemosHub;