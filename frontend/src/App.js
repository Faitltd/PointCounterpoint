import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import './reset.css'; // Import cross-browser CSS reset
import './modern-theme.css'; // Import our modern theme
import config from './config.js'; // Import API configuration

// Import sample data
import { sampleArticles } from './sampleData.js';

// Components
import ArticleList from './components/ArticleList.js';
import NewspaperSummaryView from './components/NewspaperSummaryView.js';
import CategoryWrapper from './components/CategoryWrapper.js';

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('general');

  useEffect(() => {
    fetchArticles(currentCategory);
  }, [currentCategory]);

  const fetchArticles = async (category, excludeIds = []) => {
    setLoading(true);

    try {
      console.log(`Fetching live articles for category: ${category}`);
      const backendUrl = config.API_URL;
      const apiUrl = `${backendUrl}/api/news/headlines`;

      const response = await axios.get(apiUrl, {
        params: {
          category,
          excludeIds: excludeIds.join(',')
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      setArticles(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading articles, falling back to sample data:', err);
      setError('Failed to load live articles. Showing sample stories.');

      // Fallback to sample data
      const categoryArticles = sampleArticles[category] || sampleArticles.general;
      setArticles(categoryArticles);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    if (category && category !== currentCategory) {
      setCurrentCategory(category);
      console.log(`Category changed to: ${category}`);
    }
  };

  // Handle zip code submission for local news
  const handleZipCodeSubmit = async (zipCode) => {
    setLoading(true);
    try {
      console.log(`Fetching local news for zip code: ${zipCode}`);

      // Use the configured backend URL
      const backendUrl = config.API_URL;
      const apiUrl = `${backendUrl}/api/news/local/${zipCode}`;

      const response = await axios.get(apiUrl, {
        params: {
          writingStyle: globalWritingStyle
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Local news API response:', response.data);
      setArticles(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching local news:', err);
      console.error('Error details:', err.message, err.response?.status, err.response?.data);
      setError('Failed to load local news. Please try again later.');

      // Fallback to empty array to prevent UI from being stuck in loading state
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Log the current path for debugging
  console.log('Current path:', window.location.pathname);

  return (
    <Router>
      <div className="app">
        <main className="content">
          <Routes>
            <Route
              path="/"
              element={<ArticleList
                articles={articles}
                loading={loading}
                error={error}
                onRefresh={(ids) => fetchArticles(currentCategory, ids)}
                onCategoryChange={handleCategoryChange}
                currentCategory={currentCategory}
                onZipCodeSubmit={handleZipCodeSubmit}
              />}
            />
            {/* Category-specific routes */}
            <Route
              path="/category/:category"
              element={<CategoryWrapper
                articles={articles}
                loading={loading}
                error={error}
                onRefresh={(ids) => fetchArticles(currentCategory, ids)}
                onCategoryChange={handleCategoryChange}
                currentCategory={currentCategory}
                onZipCodeSubmit={handleZipCodeSubmit}
              />}
            />
            {/* Article routes with clean URLs */}
            <Route
              path="/article/:id/:slug"
              element={<NewspaperSummaryView
                onCategoryChange={handleCategoryChange}
              />}
            />
            {/* Backward compatibility for old URLs */}
            <Route
              path="/article/:id"
              element={<NewspaperSummaryView
                onCategoryChange={handleCategoryChange}
              />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
