import React, { useEffect } from 'react';

const Call = () => {
  useEffect(() => {
    // Open a new popup window with the specified HTML file
    const callWindow = window.open(
      '/call-page.html', // This should point to the standalone HTML file
      'VideoCall',
      'width=1200,height=800,resizable=yes,scrollbars=yes'
    );

    if (callWindow) {
      callWindow.focus();
    } else {
      alert('Popup blocked! Please allow popups for this site.');
    }

    // Optionally, redirect the user back to home if they navigate to /call directly
    window.history.back();
  }, []);

  return null; // No content for this component
};

export default Call;
