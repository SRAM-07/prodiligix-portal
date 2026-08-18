import React from 'react';

const BRAND = '#068BC9';

export default function GiftingTimeline({ steps, currentStepIndex, allDone, isAdmin, onNext }) {
  const row1 = steps.slice(0, 6);
  const row2 = steps.slice(6);

  const getNodeStyle = (i) => {
    const done = allDone || i < currentStepIndex;
    const curr = i === currentStepIndex && !allDone;
    const pend = !done && !curr;
    return { done, curr, pend };
  };

  const NodeCircle = ({ i, step }) => {
    const { done, curr, pend } = getNodeStyle(i);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: done ? '#111' : curr ? BRAND : 'white',
          border: `2px solid ${done ? '#111' : curr ? BRAND : '#d1d5db'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: done || curr ? 'white' : '#9ca3af',
          opacity: pend ? 0.35 : 1,
          boxShadow: curr ? '0 0 0 6px rgba(6,139,201,0.15), 0 4px 16px rgba(6,139,201,0.4)' : done ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
          transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          flexShrink: 0,
          animation: curr ? 'glow 2s ease-in-out infinite' : 'none'
        }}>
          {done ? '✓' : String(i + 1).padStart(2, '0')}
        </div>
      </div>
    );
  };

  const Connector = ({ done, dashed }) => (
    <div style={{
      flex: 1, height: 2,
      background: done ? '#111' : '#e5e7eb',
      borderRadius: 99,
      margin: '0 4px',
      marginBottom: 20,
      borderTop: dashed ? '2px dashed #e5e7eb' : 'none',
      transition: 'background 0.5s ease',
      flexShrink: 0
    }} />
  );

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @keyframes glow { 0%,100%{box-shadow:0 0 0 6px rgba(6,139,201,0.15),0 4px 16px rgba(6,139,201,0.4);} 50%{box-shadow:0 0 0 10px rgba(6,139,201,0.08),0 4px 20px rgba(6,139,201,0.6);} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px);} to{opacity:1;transform:translateY(0);} }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8' }}>Order Journey</p>
        <p style={{ margin: '8px 0 4px', fontSize: 22, fontWeight: 800, color: allDone ? '#15803d' : '#0f172a' }}>
          {steps[currentStepIndex]?.icon} {steps[currentStepIndex]?.label}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 12 }}>
          <div style={{ width: 200, height: 3, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: allDone ? '#22c55e' : BRAND, width: `${Math.round((currentStepIndex / (steps.length - 1)) * 100)}%`, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: allDone ? '#16a34a' : BRAND }}>{Math.round((currentStepIndex / (steps.length - 1)) * 100)}%</span>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', padding: '28px 20px' }}>

        {/* Row 1 */}
        <div>
          {/* Nodes + connectors */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {row1.map((step, j) => {
              const i = j;
              const { done, curr } = getNodeStyle(i);
              return (
                <React.Fragment key={i}>
                  <NodeCircle i={i} step={step} />
                  {j < row1.length - 1 && <Connector done={allDone || i < currentStepIndex - 1 || (done && j < currentStepIndex - 1)} />}
                </React.Fragment>
              );
            })}
          </div>
          {/* Labels below row 1 */}
          <div style={{ display: 'flex', marginTop: 8 }}>
            {row1.map((step, j) => {
              const i = j;
              const { done, curr } = getNodeStyle(i);
              return (
                <div key={i} style={{ flex: j === row1.length - 1 ? 0 : 1, display: 'flex', flexDirection: 'column', alignItems: j === 0 ? 'flex-start' : j === row1.length - 1 ? 'flex-end' : 'center', minWidth: 40 }}>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: curr ? 700 : done ? 500 : 400, color: curr ? BRAND : done ? '#111' : '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>
                    {step.label.split(' ')[0]}
                  </p>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: curr ? 700 : done ? 500 : 400, color: curr ? BRAND : done ? '#111' : '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>
                    {step.label.split(' ').slice(1).join(' ')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right turn connector */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4, marginBottom: 4, paddingRight: 0 }}>
          <div style={{
            width: 40, height: 32,
            borderTop: `2px solid ${allDone || currentStepIndex >= 5 ? '#111' : '#e5e7eb'}`,
            borderRight: `2px solid ${allDone || currentStepIndex >= 5 ? '#111' : '#e5e7eb'}`,
            borderRadius: '0 12px 12px 0',
            transition: 'border-color 0.5s ease'
          }} />
        </div>

        {/* Row 2 - reversed display */}
        <div>
          {/* Labels above row 2 */}
          <div style={{ display: 'flex', marginBottom: 8 }}>
            {[...row2].reverse().map((step, j) => {
              const i = steps.length - 1 - j;
              const { done, curr } = getNodeStyle(i);
              return (
                <div key={i} style={{ flex: j === row2.length - 1 ? 0 : 1, display: 'flex', flexDirection: 'column', alignItems: j === 0 ? 'flex-end' : j === row2.length - 1 ? 'flex-start' : 'center', minWidth: 40 }}>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: curr ? 700 : done ? 500 : 400, color: curr ? BRAND : done ? '#111' : '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>
                    {step.label.split(' ')[0]}
                  </p>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: curr ? 700 : done ? 500 : 400, color: curr ? BRAND : done ? '#111' : '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>
                    {step.label.split(' ').slice(1).join(' ')}
                  </p>
                </div>
              );
            })}
          </div>
          {/* Nodes + connectors row 2 reversed */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[...row2].reverse().map((step, j) => {
              const i = steps.length - 1 - j;
              const { done, curr } = getNodeStyle(i);
              return (
                <React.Fragment key={i}>
                  <NodeCircle i={i} step={step} />
                  {j < row2.length - 1 && <Connector done={allDone || i > currentStepIndex} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin button */}
      {isAdmin && currentStepIndex < steps.length - 1 && (
        <button onClick={() => onNext(steps[currentStepIndex + 1].key)}
          style={{ marginTop: 14, width: '100%', padding: 13, borderRadius: 14, color: 'white', background: BRAND, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 14px rgba(6,139,201,0.35)' }}>
          Move to: {steps[currentStepIndex + 1]?.icon} {steps[currentStepIndex + 1]?.label} →
        </button>
      )}
    </div>
  );
}
