import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import WritingStyleDropdown from './WritingStyleDropdown.js';
import './NewspaperView.css';
import config from '../config.js'; // Import API configuration
import { createCategoryUrl, slugify } from '../utils/urlUtils.js';
import { sampleArticleDetails, writingStylePerspectives } from '../sampleData.js';

function NewspaperSummaryView({ writingStyle: globalWritingStyle, onCategoryChange }) {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

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

  useEffect(() => {
    const fetchArticle = async () => {
      console.log('Loading article with ID:', id);
      setLoading(true);

      try {
        const backendUrl = config.API_URL;
        const apiUrl = `${backendUrl}/api/news/article/${id}`;

        const response = await axios.get(apiUrl, {
          params: {
            writingStyle: globalWritingStyle
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        const articleData = response.data;
        console.log('Article data:', articleData);

        setArticle(articleData);
        setError(null);

        // If we don't have a slug in the URL, update the URL with the article title
        if (!slug && articleData.title) {
          const articleSlug = slugify(articleData.title);
          const newUrl = `/article/${id}/${articleSlug}`;
          navigate(newUrl, { replace: true });
        }
      } catch (err) {
        console.error('Error loading article from backend, using sample fallback:', err);
        // Fallback to sample data
        const articleData = sampleArticleDetails[id] || {
          id: id,
          title: 'Sample Article',
          source: { name: 'Sample Source' },
          published_at: new Date().toISOString(),
          content: 'This is a sample article with sample perspectives.',
          perspectives: [
            {
              viewpoint: 'point',
              summary: 'This is a sample perspective that presents one viewpoint on the topic.'
            },
            {
              viewpoint: 'counterpoint',
              summary: 'This is a sample perspective that presents an alternative viewpoint on the topic.'
            },
            {
              viewpoint: 'neutral',
              summary: 'This is a neutral summary of the topic without taking a particular stance.'
            }
          ]
        };

        setArticle(articleData);
        setError(null);

        if (!slug && articleData.title) {
          const articleSlug = slugify(articleData.title);
          const newUrl = `/article/${id}/${articleSlug}`;
          navigate(newUrl, { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, slug, navigate, globalWritingStyle]);

  const regeneratePerspectives = async (articleData, style) => {
    console.log('Simulating perspective generation with style:', style);
    console.log('Article ID:', id);

    setRegenerating(true);

    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get perspectives for the selected writing style
      let newPerspectives = writingStylePerspectives[style] || [
        {
          viewpoint: 'point',
          summary: 'This is a standard perspective on the topic that presents one viewpoint. The evidence suggests this interpretation has merit based on the available facts. Experts in the field have noted similar conclusions in their analysis of comparable situations.'
        },
        {
          viewpoint: 'counterpoint',
          summary: 'An alternative perspective suggests a different interpretation of the same facts. This viewpoint emphasizes different priorities and considerations that lead to a contrasting conclusion. Several studies have found evidence supporting this position as well.'
        },
        {
          viewpoint: 'neutral',
          summary: articleData.content || 'The topic presents multiple valid perspectives that reasonable people might hold based on their values and priorities.'
        }
      ];

      console.log('Generated new perspectives for style:', style);

      // Create updated article with new perspectives
      const updatedArticle = {
        ...articleData,
        perspectives: newPerspectives
      };

      // Update the article with the new perspectives
      setArticle(updatedArticle);

      // Find the point and counterpoint perspectives again
      const point = newPerspectives.find(p =>
        p.viewpoint === 'point' || p.viewpoint === 'perspective1' || p.viewpoint === 'liberal');

      const counterpoint = newPerspectives.find(p =>
        p.viewpoint === 'counterpoint' || p.viewpoint === 'perspective2' || p.viewpoint === 'conservative');

      console.log('New point perspective:', point);
      console.log('New counterpoint perspective:', counterpoint);

      setError(null);
    } catch (err) {
      console.error('Error generating perspectives:', err);
      setError('Failed to regenerate perspectives. Please try again later.');
    } finally {
      // Always set regenerating to false when done
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

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);

      // Navigate to the category URL
      const categoryUrl = createCategoryUrl(categoryId);
      navigate(categoryUrl);
    }
  };

  return (
    <div className="newspaper-view">
      <h1 className="newspaper-masthead">Point Counterpoint</h1>

      {/* Two-row category navigation */}
      <div className="newspaper-nav-container">
        <div className="newspaper-nav newspaper-nav-row-1">
          <button onClick={() => handleCategoryClick('general')}>General</button>
          <button onClick={() => handleCategoryClick('local')}>Local News</button>
          <button onClick={() => handleCategoryClick('politics')}>Politics</button>
          <button onClick={() => handleCategoryClick('business')}>Business</button>
        </div>
        <div className="newspaper-nav newspaper-nav-row-2">
          <button onClick={() => handleCategoryClick('technology')}>Technology</button>
          <button onClick={() => handleCategoryClick('entertainment')}>Entertainment</button>
          <button onClick={() => handleCategoryClick('sports')}>Sports</button>
          <button onClick={() => handleCategoryClick('science')}>Science</button>
          <button onClick={() => handleCategoryClick('health')}>Health</button>
        </div>
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
