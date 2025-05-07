import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

function ArticleList({ articles, loading, error }) {
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

  if (loading) return <div className="loading">Loading articles...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="article-list">
      <h1>Current Headlines</h1>
      {filteredArticles.length === 0 ? (
        <div className="error">No articles found</div>
      ) : (
        <div className="articles-grid">
          {filteredArticles.map(article => (
            <div key={article.id} className="article-card">
              <div className="article-card-content">
                <h2>{article.title}</h2>
                <p className="source">Source: {article.source_name}</p>
                <p className="date">Published: {new Date(article.published_at).toLocaleDateString()}</p>
                <Link to={`/article/${article.id}`} className="view-button">
                  View Perspectives
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArticleList;