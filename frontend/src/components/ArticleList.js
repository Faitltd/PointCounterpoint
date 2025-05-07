import React from 'react';
import { Link } from 'react-router-dom';
import './ArticleList.css';

function ArticleList({ articles, loading }) {
  if (loading) return <div className="loading">Loading headlines...</div>;
  
  return (
    <div className="article-list">
      <h1>Today's Headlines</h1>
      {articles.length === 0 ? (
        <p>No articles found</p>
      ) : (
        <div className="articles-grid">
          {articles.map(article => (
            <div key={article._id} className="article-card">
              <h2>{article.title}</h2>
              <p className="source">{article.source.name}</p>
              <p className="date">{new Date(article.publishedAt).toLocaleDateString()}</p>
              <Link to={`/article/${article._id}`} className="view-button">
                View Perspectives
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArticleList;