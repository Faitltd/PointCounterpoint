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

  useEffect(() => {
    fetchArticles(currentCategory);
  }, [currentCategory]);

  const fetchArticles = async (category) => {
    setLoading(true);
    try {
      console.log(`Fetching articles for category: ${category}`);
      // Use the full URL with protocol
      const apiUrl = `http://localhost:5001/api/news/headlines?category=${category}`;
      console.log('API URL:', apiUrl);

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
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
  };

  return (
    <Router>
      <div className="app">
        <NavBar onCategoryChange={handleCategoryChange} currentCategory={currentCategory} />
        <main className="content">
          <Routes>
            <Route
              path="/"
              element={<ArticleList articles={articles} loading={loading} error={error} />}
            />
            <Route
              path="/article/:id"
              element={<SummaryView />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
