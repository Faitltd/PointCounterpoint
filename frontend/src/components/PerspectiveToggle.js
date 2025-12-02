import React from 'react';

function PerspectiveToggle({ activePerspective, onPerspectiveChange }) {
  const perspectives = [
    { id: 'perspective1', label: 'Point' },
    { id: 'perspective2', label: 'Counterpoint' }
  ];

  // Function to clear the active perspective
  const clearPerspective = () => {
    onPerspectiveChange(null);
  };

  return (
    <div className="perspective-toggle">
      <h3>View Alternative Perspectives</h3>
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
        {activePerspective && (
          <button
            className="clear-button"
            onClick={clearPerspective}
          >
            Hide Perspective
          </button>
        )}
      </div>
    </div>
  );
}

export default PerspectiveToggle;
