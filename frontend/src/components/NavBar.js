import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ZipCodeInput from './ZipCodeInput';

function NavBar({ onCategoryChange, currentCategory = 'general', onZipCodeSubmit }) {
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'local', name: 'Local News' },
    { id: 'politics', name: 'Politics' },
    { id: 'business', name: 'Business' },
    { id: 'technology', name: 'Technology' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'sports', name: 'Sports' },
    { id: 'science', name: 'Science' },
    { id: 'health', name: 'Health' }
  ];

  const handleCategoryClick = (categoryId) => {
    onCategoryChange(categoryId);

    // If we're on a detail page, navigate back to the home page
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  // Handle when the Local News category is clicked
  const handleLocalCategoryClick = () => {
    // If we're on a detail page, navigate back to the home page
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Point Counterpoint
          </Link>
        </h1>
        <div className="categories">
          {categories.map(category => (
            <button
              key={category.id}
              className={currentCategory === category.id ? 'active' : ''}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Show zip code input when Local News category is selected */}
        {currentCategory === 'local' && (
          <div className="local-news-input">
            <ZipCodeInput onZipCodeSubmit={onZipCodeSubmit} />
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;