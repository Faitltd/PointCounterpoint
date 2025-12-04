import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ZipCodeInput from './ZipCodeInput.js';
import { createArticleUrl, createCategoryUrl } from '../utils/urlUtils.js';

function ArticleList({ articles, loading, error, onRefresh, onCategoryChange, currentCategory = 'general', onZipCodeSubmit }) {
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [timeAgo, setTimeAgo] = useState('');
  const navigate = useNavigate();
  const params = useParams();

  // If we have a category in the URL, use it
  useEffect(() => {
    if (params.category && params.category !== currentCategory) {
      onCategoryChange(params.category);
    }
  }, [params.category, currentCategory, onCategoryChange]);

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

  // Filter out the test article
  const filteredArticles = useMemo(() => {
    if (!articles || articles.length === 0) return [];

    // Hard-coded test article ID to exclude
    const TEST_ARTICLE_ID = 'dfe323d2-e241-4cac-8714-a4d1051e538e';

    return articles.filter(article =>
      article.id !== TEST_ARTICLE_ID &&
      !(article.title === 'Test Article' && article.source_name === 'Test Source')
    );
  }, [articles]);

  // Update the time ago text every minute
  useEffect(() => {
    // Update time ago text initially
    updateTimeAgo();

    // Set up interval to update time ago text
    const interval = setInterval(updateTimeAgo, 60000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [lastRefreshTime]);

  // Update the time ago text
  const updateTimeAgo = () => {
    const now = new Date();
    const diffMs = now - lastRefreshTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      setTimeAgo('just now');
    } else if (diffMins === 1) {
      setTimeAgo('1 minute ago');
    } else if (diffMins < 60) {
      setTimeAgo(`${diffMins} minutes ago`);
    } else {
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) {
        setTimeAgo('1 hour ago');
      } else {
        setTimeAgo(`${diffHours} hours ago`);
      }
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setLastRefreshTime(new Date());
    const idsToExclude = filteredArticles.map(a => a.id).filter(Boolean);
    onRefresh(idsToExclude);
  };

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);

      // Navigate to the category URL
      const categoryUrl = createCategoryUrl(categoryId);
      navigate(categoryUrl);
    }
  };

  if (loading) return <div className="loading">"If you don't read the newspaper, you're uninformed. If you read the newspaper, you're misinformed." — Mark Twain</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="article-list">
      <div className="newspaper-view">
        <h1 className="newspaper-masthead">Point Counterpoint</h1>

        {/* Two-row category navigation */}
        <div className="newspaper-nav-container">
          <div className="newspaper-nav newspaper-nav-row-1">
            <button
              className={currentCategory === 'general' ? 'active' : ''}
              onClick={() => handleCategoryClick('general')}
            >
              General
            </button>
            <button
              className={currentCategory === 'local' ? 'active' : ''}
              onClick={() => handleCategoryClick('local')}
            >
              Local News
            </button>
            <button
              className={currentCategory === 'politics' ? 'active' : ''}
              onClick={() => handleCategoryClick('politics')}
            >
              Politics
            </button>
            <button
              className={currentCategory === 'business' ? 'active' : ''}
              onClick={() => handleCategoryClick('business')}
            >
              Business
            </button>
          </div>
          <div className="newspaper-nav newspaper-nav-row-2">
            <button
              className={currentCategory === 'technology' ? 'active' : ''}
              onClick={() => handleCategoryClick('technology')}
            >
              Technology
            </button>
            <button
              className={currentCategory === 'entertainment' ? 'active' : ''}
              onClick={() => handleCategoryClick('entertainment')}
            >
              Entertainment
            </button>
            <button
              className={currentCategory === 'sports' ? 'active' : ''}
              onClick={() => handleCategoryClick('sports')}
            >
              Sports
            </button>
            <button
              className={currentCategory === 'science' ? 'active' : ''}
              onClick={() => handleCategoryClick('science')}
            >
              Science
            </button>
            <button
              className={currentCategory === 'health' ? 'active' : ''}
              onClick={() => handleCategoryClick('health')}
            >
              Health
            </button>
          </div>
        </div>

        {/* Show zip code input when Local News category is selected */}
        {currentCategory === 'local' && (
          <div className="local-news-input">
            <ZipCodeInput onZipCodeSubmit={onZipCodeSubmit} />
          </div>
        )}

        <div className="headline-container">
          <h2>Current Headlines</h2>
          <div className="controls-container">
            <div className="refresh-container">
              <button onClick={handleRefresh} className="refresh-button" disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh Stories'}
              </button>
              <p className="last-refreshed">Last refreshed: {timeAgo}</p>
            </div>
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="error">No articles found</div>
        ) : (
          <div className="articles-grid">
            {filteredArticles.map(article => (
              <div key={article.id} className="article-card">
                <div className="article-card-content">
                  <Link
                    to={createArticleUrl(article.id, article.title, currentCategory)}
                    className="article-title-link"
                    onClick={() => console.log('Clicked article with ID:', article.id)}
                  >
                    <h2>{article.title}</h2>
                  </Link>
                  <p className="source">Source: {article.source_name}</p>
                  <p className="date">Published: {new Date(article.published_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticleList;
