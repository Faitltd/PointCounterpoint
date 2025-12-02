import React, { useState, useEffect } from 'react';
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
  const [globalWritingStyle, setGlobalWritingStyle] = useState('standard');

  useEffect(() => {
    fetchArticles(currentCategory);
  }, [currentCategory]);

  const fetchArticles = async (category) => {
    setLoading(true);

    try {
      console.log(`Loading sample articles for category: ${category}`);

      // Short timeout to simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the sample articles for the selected category, or fall back to general
      const categoryArticles = sampleArticles[category] || sampleArticles.general;

      if (categoryArticles && categoryArticles.length > 0) {
        setArticles(categoryArticles);
        setError(null);
      } else {
        throw new Error('No articles available for this category');
      }
    } catch (err) {
      console.error('Error loading articles:', err);
      setError('Failed to load articles. Please try again later.');

      // Fallback to general articles
      setArticles(sampleArticles.general);
    } finally {
      setLoading(false);
    }
  };

  const handleWritingStyleChange = (style) => {
    console.log(`Changing global writing style to: ${style}`);
    setGlobalWritingStyle(style);
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
                onRefresh={() => fetchArticles(currentCategory)}
                writingStyle={globalWritingStyle}
                onWritingStyleChange={handleWritingStyleChange}
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
                onRefresh={() => fetchArticles(currentCategory)}
                writingStyle={globalWritingStyle}
                onWritingStyleChange={handleWritingStyleChange}
                onCategoryChange={handleCategoryChange}
                currentCategory={currentCategory}
                onZipCodeSubmit={handleZipCodeSubmit}
              />}
            />
            {/* Article routes with clean URLs */}
            <Route
              path="/article/:id/:slug"
              element={<NewspaperSummaryView
                writingStyle={globalWritingStyle}
                onCategoryChange={handleCategoryChange}
              />}
            />
            {/* Backward compatibility for old URLs */}
            <Route
              path="/article/:id"
              element={<NewspaperSummaryView
                writingStyle={globalWritingStyle}
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
