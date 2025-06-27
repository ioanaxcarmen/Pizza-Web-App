import React from 'react';
// 1. Import the IframeViewer component we created earlier.
//    (Adjust the path if your component is in a different folder)
import IframeViewer from '../components/iFrameViewer';

const Customer = () => {
  // 2. Define the Power BI report URL you want to test.
  //    IMPORTANT: Replace the placeholder below with the actual URL
  //    you copied from the Power BI service.
  const reportUrl = "https://app.powerbi.com/reportEmbed?reportId=8174a6e1-0792-4bfb-b050-71ddd76ed003&autoAuth=true&ctid=66c5e13f-8c43-4359-b2e8-51775c6d298d";

  return (
    <div style={{ padding: '20px' }}>
      {/* This is your original heading */}
      <h2>Customer Page (Power BI goes here)</h2>
      <p>This is a test of the secure iframe embedding method.</p>
      
      <hr style={{ margin: '20px 0' }} />

      {/* 3. Add the IframeViewer component below your heading */}
      <IframeViewer
        embedUrl={reportUrl}
        title="Customer Report"
      />
    </div>
  );
};

export default Customer;