import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import NavBar from './components/NavBar';
import ArticleList from './components/ArticleList';
import SummaryView from './components/SummaryView';

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
      const response = await axios.get(`http://localhost:5000/api/news/headlines?category=${category}`);
      setArticles(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching articles:', err);
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
        <NavBar onCategoryChange={handleCategoryChange} />
        <div className="content">
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
        </div>
      </div>
    </Router>
  );
}

export default App;
