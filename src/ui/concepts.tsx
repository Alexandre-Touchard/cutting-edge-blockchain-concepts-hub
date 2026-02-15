import React from 'react';
import {
  ArrowLeftRight,
  Blocks,
  Coins,
  Cpu,
  Database,
  GitBranch,
  Hash,
  Layers,
  Network,
  Scale,
  Shield,
  Shuffle,
  TrendingDown
} from 'lucide-react';
import { defineMaybe } from '../demos/glossary';
import type { DemoMeta } from './Hub';

export type ConceptChip = {
  concept: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  definition?: string;
};

const conceptIconMap: Record<string, ConceptChip['Icon']> = {
  // AMM / DeFi
  'Constant Product': Coins,
  'Constant Product (k)': Coins,
  Slippage: Scale,
  'Price Impact': TrendingDown,
  'Impermanent Loss': TrendingDown,
  'Liquidity Provision': Coins,
  Liquidity: Coins,

  // L2
  Rollups: Layers,
  Batching: Blocks,
  'State Roots': Hash,
  'State Root': Hash,
  'Merkle Root': Hash,
  'Gas Economics': Coins,

  // Consensus / DAG
  'Directed Acyclic Graph': GitBranch,
  'Tip Selection': Shuffle,
  'Cumulative Weight': Scale,
  Confirmation: Shield,

  // Security / restaking
  Restaking: Shield,
  'Shared Security': Shield,
  Slashing: Shield,
  AVS: Network,

  // Data availability
  'Data Availability': Database,
  Sampling: Shuffle,
  'Random Sampling': Shuffle,
  'Erasure Coding': Blocks,

  // Interop
  'Light Clients': Shield,
  'Cross-Chain Messaging': ArrowLeftRight,
  Bridges: ArrowLeftRight,
  'Trust Models': Shield,

  // Execution
  'Parallel Execution': Cpu,
  'Conflict Detection': Shield,
  'Transaction Ordering': Shuffle,
  'Block-STM': Cpu,

  // Core blockchain
  Mining: Cpu,
  'Proof of Work': Cpu,
  Hashing: Hash,
  Hash: Hash,
  Nonce: Hash,
  'State Machine': Blocks,
  'Transaction Pool': Database
};

const categoryFallbackIcon: Record<DemoMeta['category'], ConceptChip['Icon']> = {
  consensus: Shield,
  scaling: Layers,
  execution: Cpu,
  data: Database,
  interop: ArrowLeftRight,
  security: Shield,
  defi: Coins
};

export function getConceptChip(concept: string, demoCategory: DemoMeta['category']): ConceptChip {
  const Icon = conceptIconMap[concept] ?? categoryFallbackIcon[demoCategory] ?? Shield;
  const definition = defineMaybe(concept);
  return { concept, Icon, definition };
}
