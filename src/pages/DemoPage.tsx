import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { loadDemos } from '../demos/loadDemos';
import EduTooltip from '../ui/EduTooltip';
import { getConceptChip } from '../ui/concepts';

export default function DemoPage() {
  const { demoId } = useParams();
  const demos = useMemo(() => loadDemos(), []);

  const demo = demos.find((d) => d.meta.id === demoId);

  if (!demo) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
            <ArrowLeft size={16} /> Back to Hub
          </Link>
          <h1 className="text-2xl font-bold mt-6">Demo not found</h1>
          <p className="text-slate-400 mt-2">Unknown demo id: {demoId}</p>
        </div>
      </div>
    );
  }

  const DemoComponent = demo.Component;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Hub
          </Link>
          <div className="min-w-0 text-right">
            <div className="text-sm text-slate-400">Now viewing</div>
            <div className="font-semibold truncate">{demo.meta.title}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-xs font-semibold text-slate-400 mb-2">Key concepts</div>
          <div className="flex flex-wrap gap-2">
            {demo.meta.concepts.map((concept) => {
              const chip = getConceptChip(concept, demo.meta.category);
              const Icon = chip.Icon;
              const def = chip.definition ?? 'Definition coming soon.';
              return (
                <span
                  key={concept}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-200"
                >
                  <Icon size={14} className="text-slate-300" />
                  <span>{concept}</span>
                  <EduTooltip text={def} />
                </span>
              );
            })}
          </div>
        </div>

        <DemoComponent />
      </div>
    </div>
  );
}
