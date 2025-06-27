import React from 'react';

// This component accepts the embedUrl and a title as props.
const IframeViewer = ({ embedUrl, title }) => {
  // Basic validation to make sure we have a URL.
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

// You can move these styles to your main CSS file if you prefer.
const styles = {
  container: {
    width: '100%',
    height: '80vh', // Takes up 80% of the viewport height
    border: '1px solid #ddd',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden' // Ensures the iframe corners are also rounded
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none'
  }
};

export default IframeViewer;