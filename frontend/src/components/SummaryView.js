import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './SummaryView.css';
import PerspectiveToggle from './PerspectiveToggle';

function SummaryView() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePerspective, setActivePerspective] = useState('neutral');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/news/article/${id}`);
        setArticle(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handlePerspectiveChange = (perspective) => {
    setActivePerspective(perspective);
  };

  if (loading) return <div className="loading">Loading article...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!article) return <div className="error">Article not found</div>;

  const activeSummary = article.perspectives.find(p => p.viewpoint === activePerspective);

  return (
    <div className="summary-view">
      <Link to="/" className="back-link">← Back to Headlines</Link>
      
      <h1>{article.title}</h1>
      <p className="source">Source: {article.source.name}</p>
      <p className="date">Published: {new Date(article.publishedAt).toLocaleDateString()}</p>
      
      <PerspectiveToggle 
        activePerspective={activePerspective} 
        onPerspectiveChange={handlePerspectiveChange} 
      />
      
      <div className="summary-content">
        <h2>{activePerspective.charAt(0).toUpperCase() + activePerspective.slice(1)} Perspective</h2>
        <p>{activeSummary ? activeSummary.summary : 'No summary available for this perspective.'}</p>
      </div>
      
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="original-link">
        Read Original Article
      </a>
    </div>
  );
}

export default SummaryView;
