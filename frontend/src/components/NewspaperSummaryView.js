import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import WritingStyleDropdown from './WritingStyleDropdown.js';
import './NewspaperView.css';

function NewspaperSummaryView({ writingStyle: globalWritingStyle }) {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const regeneratePerspectives = async (articleData, style) => {
    console.log('Starting perspective generation with style:', style);
    console.log('Article data:', articleData);

    setRegenerating(true);
    try {
      // Use local backend URL for local testing
      const backendUrl = 'http://localhost:5001';
      const apiUrl = `${backendUrl}/api/news/regenerate/${id}`;

      console.log('Sending request to:', apiUrl);
      console.log('With payload:', { writingStyle: style || 'default' });

      // Make a direct request to test the API endpoint
      try {
        const testResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ writingStyle: style || 'default' }),
        });

        if (!testResponse.ok) {
          console.error('Test request failed:', testResponse.status, testResponse.statusText);
          const errorText = await testResponse.text();
          console.error('Error response:', errorText);
        } else {
          const responseData = await testResponse.json();
          console.log('Test request successful:', responseData);

          // Update the article with the new perspectives
          setArticle(responseData);

          // Force a re-render
          setTimeout(() => {
            console.log('Forcing re-render after perspective generation');
            setRegenerating(false);
          }, 500);

          return;
        }
      } catch (testError) {
        console.error('Test request error:', testError);
      }

      // If the test request failed, try the original axios request
      const response = await axios.post(apiUrl, {
        writingStyle: style || 'default'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Regenerated perspectives response:', response);
      console.log('Regenerated perspectives data:', response.data);

      if (response.data && response.data.perspectives) {
        console.log('New perspectives:', response.data.perspectives);
      } else {
        console.warn('No perspectives found in response data');
      }

      setArticle(response.data);

      // Force a re-render
      setTimeout(() => {
        console.log('Forcing re-render after perspective generation');
        setRegenerating(false);
      }, 500);
    } catch (err) {
      console.error('Error regenerating perspectives:', err);
      console.error('Error details:', err.message, err.response?.status, err.response?.data);
      setError('Failed to regenerate perspectives. Please try again later.');
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

  // Function to format perspective content
  const formatPerspectiveContent = (content) => {
    if (!content) return 'No perspective available.';

    // Split content by paragraphs and wrap each in a <p> tag
    const paragraphs = content.split('\n\n');
    return (
      <>
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </>
    );
  };

  // Find the point and counterpoint perspectives
  const pointPerspective = article.perspectives && article.perspectives.find(p =>
    p.viewpoint === 'point' || p.viewpoint === 'perspective1' || p.viewpoint === 'liberal');

  const counterpointPerspective = article.perspectives && article.perspectives.find(p =>
    p.viewpoint === 'counterpoint' || p.viewpoint === 'perspective2' || p.viewpoint === 'conservative');

  // Log perspectives for debugging
  console.log('Point perspective:', pointPerspective);
  console.log('Counterpoint perspective:', counterpointPerspective);

  return (
    <div className="newspaper-view">
      <h1 className="newspaper-masthead">Point Counterpoint</h1>
      <div className="newspaper-nav">
        <Link to="/category/general">General</Link>
        <Link to="/category/politics">Politics</Link>
        <Link to="/category/business">Business</Link>
        <Link to="/category/technology">Technology</Link>
        <Link to="/category/entertainment">Entertainment</Link>
        <Link to="/category/sports">Sports</Link>
        <Link to="/category/science">Science</Link>
        <Link to="/category/health">Health</Link>
      </div>
      <div className="newspaper-header">
        <Link to="/" className="back-link">← Back to headlines</Link>
        <h2 className="newspaper-title">{article.title}</h2>
        <div className="newspaper-metadata">
          <p className="source">Source: {article.source_name}</p>
          <p className="date">Published: {new Date(article.published_at).toLocaleDateString()}</p>
        </div>
      </div>

      {regenerating && <div className="regenerating-message">"The function of education is to teach one to think intensively and to think critically. Intelligence plus character - that is the goal of true education." — Martin Luther King Jr.</div>}

      {/* Neutral perspective is always shown as a lead paragraph */}
      <div className="newspaper-lead">
        <p className="lead-text">{neutralPerspective ? neutralPerspective.summary : 'No summary available for this article.'}</p>
      </div>

      {/* Display both perspectives side by side in columns */}
      <div className="newspaper-columns">
        <div className="newspaper-column">
          <div className="column-content">
            <h2 className="column-title">Point</h2>
            {pointPerspective && pointPerspective.pointTitle && (
              <h3 className="column-subtitle">{pointPerspective.pointTitle}</h3>
            )}
            <div className="column-text">
              {pointPerspective ? formatPerspectiveContent(pointPerspective.summary) : 'No point perspective available.'}
            </div>
          </div>
        </div>

        <div className="newspaper-column">
          <div className="column-content">
            <h2 className="column-title">Counterpoint</h2>
            {counterpointPerspective && counterpointPerspective.counterpointTitle && (
              <h3 className="column-subtitle">{counterpointPerspective.counterpointTitle}</h3>
            )}
            <div className="column-text">
              {counterpointPerspective ? formatPerspectiveContent(counterpointPerspective.summary) : 'No counterpoint perspective available.'}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Perspectives Button - Shown when perspectives are missing */}
      {(!pointPerspective || !counterpointPerspective) && (
        <div className="generate-button-container">
          <h3 className="generate-button-heading">Perspectives not available for this article</h3>
          <button
            className="regenerate-button"
            onClick={() => regeneratePerspectives(article, globalWritingStyle)}
            disabled={regenerating}
          >
            {regenerating ? 'Generating Perspectives...' : 'Generate Point/Counterpoint Perspectives'}
          </button>
          <p className="generate-button-note">Click the button above to generate perspectives for this article</p>
        </div>
      )}

      <div className="newspaper-footer">
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="view-button">
          Read Original Article
        </a>
      </div>
    </div>
  );
}

export default NewspaperSummaryView;
