import React from 'react';
import TernaryPlot from '@/components/TernaryPlot';

export const metadata = {
  title: 'Ternary Plot Preview'
};

const sampleData: Array<{ values: [number, number, number] }> = [
  { values: [0.9, 0.05, 0.05] }, // mostly A
  { values: [0.05, 0.9, 0.05] }, // mostly B
  { values: [0.05, 0.05, 0.9] }, // mostly C
  { values: [0.33, 0.33, 0.34] },
  { values: [0.5, 0.25, 0.25] },
  { values: [0.25, 0.5, 0.25] },
  { values: [0.25, 0.25, 0.5] },
  { values: [0.6, 0.3, 0.1] },
  { values: [0.1, 0.6, 0.3] }
];

export default function TernaryPreview() {
  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <TernaryPlot
        data={sampleData}
        labels={['Field A', 'Field B', 'Field C']}
        width={300}
        height={300}
        title="Ternary Plot Preview"
        collapsible={false}
      />
    </div>
  );
} 