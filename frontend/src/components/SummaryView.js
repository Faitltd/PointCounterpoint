import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import PerspectiveToggle from './PerspectiveToggle.js';

function SummaryView() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePerspective, setActivePerspective] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      console.log('Fetching article with ID:', id);
      try {
        const response = await axios.get(`http://localhost:5001/api/news/article/${id}`);
        console.log('Article data received:', response.data);
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

  // Find the neutral perspective
  const neutralPerspective = article.perspectives && article.perspectives.find(p => p.viewpoint === 'neutral');

  // Find the active perspective (liberal or conservative) if one is selected
  const activeSummary = activePerspective && article.perspectives &&
    article.perspectives.find(p => p.viewpoint === activePerspective);

  return (
    <div className="summary-view">
      <Link to="/" className="back-link">← Back to headlines</Link>

      <h1>{article.title}</h1>
      <p className="source">Source: {article.source_name}</p>
      <p className="date">Published: {new Date(article.published_at).toLocaleDateString()}</p>

      {/* Neutral perspective is always shown */}
      <div className="summary-content neutral-content">
        <h2>Summary</h2>
        <p>{neutralPerspective ? neutralPerspective.summary : 'No summary available for this article.'}</p>
      </div>

      {/* Perspective toggle for liberal and conservative views */}
      <PerspectiveToggle
        activePerspective={activePerspective}
        onPerspectiveChange={handlePerspectiveChange}
      />

      {/* Only show this section if a perspective is selected */}
      {activePerspective && (
        <div className="summary-content perspective-content">
          <h2>{activePerspective.charAt(0).toUpperCase() + activePerspective.slice(1)} Perspective</h2>
          <p>{activeSummary ? activeSummary.summary : `No ${activePerspective} perspective available.`}</p>
        </div>
      )}

      <a href={article.url} target="_blank" rel="noopener noreferrer" className="view-button">
        Read Original Article
      </a>
    </div>
  );
}

export default SummaryView;
