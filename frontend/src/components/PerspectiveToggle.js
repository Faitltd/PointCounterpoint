import React from 'react';
import './PerspectiveToggle.css';

function PerspectiveToggle({ activePerspective, onPerspectiveChange }) {
  const perspectives = [
    { id: 'liberal', label: 'Liberal' },
    { id: 'neutral', label: 'Neutral' },
    { id: 'conservative', label: 'Conservative' }
  ];
  
  return (
    <div className="perspective-toggle">
      <h3>View From Different Perspectives:</h3>
      <div className="toggle-buttons">
        {perspectives.map(perspective => (
          <button 
            key={perspective.id}
            className={activePerspective === perspective.id ? 'active' : ''}
            onClick={() => onPerspectiveChange(perspective.id)}
          >
            {perspective.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PerspectiveToggle;
