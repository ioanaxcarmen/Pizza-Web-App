import React from 'react';

// Renders an iframe for embedding Power BI reports or other  BI content
const IframeViewer = ({ embedUrl, title }) => {
  // Basic validation to make sure we have a URL before rendering 
  if (!embedUrl) {
    return <div>Error: No embed URL provided.</div>;
  }

  return (
    <div style={styles.container}>
      <iframe
        title={title || 'Power BI Report'}
        style={styles.iframe}
        src={embedUrl}
        allowFullScreen={true}
      ></iframe>
    </div>
  );
};

// CSS styles for the iframe container and iframe element
const styles = {
  container: {
    width: '100%',
    height: '80vh',
    border: '1px solid #ddd',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden' 
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none'
  }
};

export default IframeViewer;