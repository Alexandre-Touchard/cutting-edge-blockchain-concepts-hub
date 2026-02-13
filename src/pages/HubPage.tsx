import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hub, { type DemoMeta } from '../ui/Hub';
import DemoDetailsModal from '../ui/DemoDetailsModal';
import { loadDemos } from '../demos/loadDemos';

export default function HubPage() {
  const navigate = useNavigate();
  const demos = useMemo(() => loadDemos(), []);

  const [selected, setSelected] = useState<DemoMeta | null>(null);

  return (
    <>
      <Hub
        demos={demos.map((d) => d.meta)}
        onOpenDemo={(demo) => setSelected(demo)}
      />

      <DemoDetailsModal
        demo={selected}
        onClose={() => setSelected(null)}
        onStart={(demoId) => navigate(`/demo/${demoId}`)}
      />
    </>
  );
}
