import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ArticleList from './ArticleList.js';

/**
 * Wrapper component that extracts the category from URL parameters
 * and passes it to the ArticleList component
 */
function CategoryWrapper(props) {
  const { category } = useParams();
  const { onCategoryChange, currentCategory, ...otherProps } = props;

  // Update the category when the URL parameter changes
  useEffect(() => {
    if (category && category !== currentCategory) {
      onCategoryChange(category);
    }
  }, [category, currentCategory, onCategoryChange]);

  return (
    <ArticleList
      {...otherProps}
      onCategoryChange={onCategoryChange}
      currentCategory={category || currentCategory}
    />
  );
}

export default CategoryWrapper;
