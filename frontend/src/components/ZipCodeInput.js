import React, { useState } from 'react';

function ZipCodeInput({ onZipCodeSubmit }) {
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation for US zip codes
    if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
      setError('Please enter a valid 5-digit US zip code');
      return;
    }
    
    setError('');
    onZipCodeSubmit(zipCode);
  };

  return (
    <div className="zip-code-input">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter zip code for local news"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          maxLength={10}
          aria-label="Zip code for local news"
        />
        <button type="submit">Get Local News</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ZipCodeInput;
