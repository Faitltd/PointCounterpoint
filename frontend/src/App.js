import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './modern-theme.css'; // Import our modern theme

// Components
import NavBar from './components/NavBar.js';
import ArticleList from './components/ArticleList.js';
import SummaryView from './components/SummaryView.js';

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
      console.log(`Fetching articles for category: ${category}`);

      // Use direct backend URL for production to bypass proxy issues
      const backendUrl = 'https://pointcounterpoint-backend-526297187726.us-central1.run.app';
      const apiUrl = `${backendUrl}/api/news/headlines?category=${category}`;

      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('API response:', response.data);
      setArticles(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching articles:', err);
      console.error('Error details:', err.message, err.response?.status, err.response?.data);
      setError('Failed to load articles. Please try again later.');

      // Fallback to empty array to prevent UI from being stuck in loading state
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWritingStyleChange = (style) => {
    console.log(`Changing global writing style to: ${style}`);
    setGlobalWritingStyle(style);
  };

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
  };

  // Handle zip code submission for local news
  const handleZipCodeSubmit = async (zipCode) => {
    setLoading(true);
    try {
      console.log(`Fetching local news for zip code: ${zipCode}`);

      // Use direct backend URL for production to bypass proxy issues
      const backendUrl = 'https://pointcounterpoint-backend-526297187726.us-central1.run.app';
      const apiUrl = `${backendUrl}/api/news/local/${zipCode}`;

      const response = await axios.get(apiUrl, {
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
        <NavBar
          onCategoryChange={handleCategoryChange}
          currentCategory={currentCategory}
          onZipCodeSubmit={handleZipCodeSubmit}
        />
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
              />}
            />
            <Route
              path="/article/:id"
              element={<SummaryView
                writingStyle={globalWritingStyle}
              />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
