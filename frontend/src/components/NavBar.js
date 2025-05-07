import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar({ onCategoryChange }) {
  const categories = [
    { id: 'general', name: 'General' },
    { id: 'business', name: 'Business' },
    { id: 'technology', name: 'Technology' },
    { id: 'politics', name: 'Politics' },
    { id: 'health', name: 'Health' }
  ];
  
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">News Perspectives</Link>
      </div>
      <div className="categories">
        {categories.map(category => (
          <button 
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;