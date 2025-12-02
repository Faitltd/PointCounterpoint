import React from 'react';
import '../modern-theme.css';

function WritingStyleDropdown({ selectedStyle, onStyleChange }) {
  const styles = [
    { id: 'standard', label: 'Standard GPT' },
    { id: 'thompson', label: 'Hunter S. Thompson' },
    { id: 'parker', label: 'Dorothy Parker' },
    { id: 'sagan', label: 'Carl Sagan' },
    { id: 'baldwin', label: 'James Baldwin' },
    { id: 'pratchett', label: 'Terry Pratchett' },
    { id: 'eli5', label: 'Explain Like I\'m 5' }
  ];

  return (
    <div className="writing-style-dropdown">
      <label htmlFor="writing-style">News read to you by:</label>
      <select
        id="writing-style"
        value={selectedStyle}
        onChange={(e) => onStyleChange(e.target.value)}
      >
        {styles.map(style => (
          <option key={style.id} value={style.id}>
            {style.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default WritingStyleDropdown;
