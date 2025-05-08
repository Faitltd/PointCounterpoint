import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WritingStyleDropdown from './WritingStyleDropdown.js';

function ArticleList({ articles, loading, error, onRefresh, writingStyle, onWritingStyleChange }) {
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [timeAgo, setTimeAgo] = useState('');

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
    onRefresh();
  };

  if (loading) return <div className="loading">"If you don't read the newspaper, you're uninformed. If you read the newspaper, you're misinformed." — Mark Twain</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="article-list">
      <div className="headline-container">
        <h1>Current Headlines</h1>
        <div className="controls-container">
          <div className="refresh-container">
            <button onClick={handleRefresh} className="refresh-button" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Stories'}
            </button>
            <p className="last-refreshed">Last refreshed: {timeAgo}</p>
          </div>
          <div className="style-container">
            <WritingStyleDropdown
              selectedStyle={writingStyle}
              onStyleChange={onWritingStyleChange}
            />
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
                  to={`/article/${article.id}`}
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
  );
}

export default ArticleList;