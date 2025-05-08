import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import PerspectiveToggle from './PerspectiveToggle.js';
import WritingStyleDropdown from './WritingStyleDropdown.js';

function SummaryView({ writingStyle: globalWritingStyle }) {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePerspective, setActivePerspective] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      console.log('Fetching article with ID:', id);
      try {
        // Use local backend URL for local testing
        const backendUrl = 'http://localhost:5001';
        const apiUrl = `${backendUrl}/api/news/article/${id}`;
        console.log('API URL:', apiUrl);

        // Add a timestamp to prevent caching
        const response = await axios.get(apiUrl, {
          params: { _t: new Date().getTime() },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('Article data received:', response.data);
        console.log('Perspectives in response:', response.data.perspectives);

        // Store the article data
        setArticle(response.data);
        setError(null);

        // If we have a global writing style that's not standard, regenerate perspectives
        if (globalWritingStyle !== 'standard') {
          console.log(`Using global writing style: ${globalWritingStyle}`);
          regeneratePerspectives(response.data, globalWritingStyle);
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        console.error('Error details:', err.message, err.response?.status, err.response?.data);
        setError('Failed to load article. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, globalWritingStyle]);

  const handlePerspectiveChange = (perspective) => {
    setActivePerspective(perspective);
  };

  const regeneratePerspectives = async (articleData, style) => {
    setRegenerating(true);
    try {
      // Use local backend URL for local testing
      const backendUrl = 'http://localhost:5001';
      const apiUrl = `${backendUrl}/api/news/regenerate/${id}`;
      const response = await axios.post(apiUrl, {
        writingStyle: style
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Regenerated perspectives:', response.data);
      setArticle(response.data);
    } catch (err) {
      console.error('Error regenerating perspectives:', err);
      setError('Failed to regenerate perspectives. Please try again later.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <div className="loading">"The press is the best instrument for enlightening the mind of man, and improving him as a rational, moral and social being." — Thomas Jefferson</div>;
  if (error) return <div className="error">{error}</div>;
  if (!article) return <div className="error">Article not found</div>;

  console.log('Article perspectives:', article.perspectives);

  // Find the neutral perspective
  const neutralPerspective = article.perspectives && article.perspectives.find(p =>
    p.viewpoint === 'neutral' || p.viewpoint === 'perspective3');

  // Find the active perspective if one is selected
  const activeSummary = activePerspective && article.perspectives &&
    article.perspectives.find(p =>
      (activePerspective === 'perspective1' && (p.viewpoint === 'point' || p.viewpoint === 'perspective1' || p.viewpoint === 'liberal')) ||
      (activePerspective === 'perspective2' && (p.viewpoint === 'counterpoint' || p.viewpoint === 'perspective2' || p.viewpoint === 'conservative'))
    );

  // Get the title for the active perspective
  const getActiveTitle = () => {
    if (!activeSummary) return '';

    if (activePerspective === 'perspective1') {
      return activeSummary.pointTitle || '';
    } else if (activePerspective === 'perspective2') {
      return activeSummary.counterpointTitle || '';
    }
    return '';
  };

  // Function to format perspective content
  const formatPerspectiveContent = (content) => {
    if (!content) return 'No perspective available.';
    return <p>{content}</p>;
  };

  // Function to get a display name for the perspective
  const getPerspectiveDisplayName = (perspectiveId) => {
    if (perspectiveId === 'perspective1') return 'Point';
    if (perspectiveId === 'perspective2') return 'Counterpoint';
    return perspectiveId.charAt(0).toUpperCase() + perspectiveId.slice(1);
  };

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

      {/* Controls for perspectives */}
      <div className="perspective-controls">
        <PerspectiveToggle
          activePerspective={activePerspective}
          onPerspectiveChange={handlePerspectiveChange}
        />
      </div>

      {regenerating && <div className="regenerating-message">"The function of education is to teach one to think intensively and to think critically. Intelligence plus character - that is the goal of true education." — Martin Luther King Jr.</div>}

      {/* Only show this section if a perspective is selected */}
      {activePerspective && (
        <div className="summary-content perspective-content">
          <div className="perspective-header">
            <h2>{getPerspectiveDisplayName(activePerspective)}</h2>
            {getActiveTitle() && <h3 className="perspective-title">{getActiveTitle()}</h3>}
          </div>
          <div className="perspective-formatted-content">
            {activeSummary ? formatPerspectiveContent(activeSummary.summary) : `No ${activePerspective} perspective available.`}
          </div>
        </div>
      )}

      <a href={article.url} target="_blank" rel="noopener noreferrer" className="view-button">
        Read Original Article
      </a>
    </div>
  );
}

export default SummaryView;
