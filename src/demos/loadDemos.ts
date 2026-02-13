import type React from 'react';
import type { DemoMeta } from '../ui/Hub';
import { demoMetaRegistry } from './demoRegistry';

export type ImplDemoModule = {
  default: React.ComponentType;
  /** Optional rich metadata override (recommended). */
  demoMeta?: Partial<Omit<DemoMeta, 'id' | 'title'>> & Pick<DemoMeta, 'category' | 'difficulty'> & {
    id?: string;
    title?: string;
  };
};

export type LoadedDemo = {
  meta: DemoMeta;
  Component: React.ComponentType;
  sourcePath: string;
};

function filenameToId(filename: string): string {
  // remove extension
  const base = filename.replace(/\.[^.]+$/, '');
  // normalize: underscores/spaces -> dash, collapse dashes
  return base
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function filenameToTitle(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  const words = base
    .replace(/[_-]+/g, ' ')
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());
  return words;
}

function inferDefaultsFromPath(sourcePath: string): Pick<DemoMeta, 'id' | 'title' | 'thumbnail' | 'description' | 'tags' | 'concepts' | 'keyTakeaways' | 'category' | 'difficulty'> {
  const filename = sourcePath.split('/').pop() ?? sourcePath;
  const inferredId = filenameToId(filename);
  const inferredTitle = filenameToTitle(filename);

  const registry = demoMetaRegistry[inferredId];

  // Conservative defaults (can be overridden by registry + demoMeta export)
  return {
    id: registry?.id ?? inferredId,
    title: registry?.title ?? inferredTitle,
    thumbnail: registry?.thumbnail ?? '🧩',
    description: registry?.description ?? 'Interactive blockchain demo.',
    concepts: registry?.concepts ?? [],
    keyTakeaways: registry?.keyTakeaways ?? [],
    tags: registry?.tags ?? [],
    category: (registry?.category as DemoMeta['category']) ?? 'execution',
    difficulty: (registry?.difficulty as DemoMeta['difficulty']) ?? 'Intermediate'
  };
}

export function loadDemos(): LoadedDemo[] {
  // Auto-discover demo implementations.
  // Files must default-export a React component.
  const modules = import.meta.glob<ImplDemoModule>('./impl/*.tsx', { eager: true });

  const demos = Object.entries(modules).map(([sourcePath, mod]) => {
    const defaults = inferDefaultsFromPath(sourcePath);
    const metaOverride = mod.demoMeta ?? {};

    const meta: DemoMeta = {
      ...defaults,
      ...metaOverride,
      id: metaOverride.id ?? defaults.id,
      title: metaOverride.title ?? defaults.title
    };

    return {
      meta,
      Component: mod.default,
      sourcePath
    };
  });

  demos.sort((a, b) => a.meta.title.localeCompare(b.meta.title));
  return demos;
}
