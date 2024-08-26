import { useState } from 'react';

function SubmitReviewPageForm() {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_AWS_LAMBDA_GATEWAY_API, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        // Send the url to the API route.
        body: JSON.stringify({ url: url }),
      });
      const data = await response.json();
      console.log('Scraped Data:', data);
    } 
    catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter RateMyProfessors URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default SubmitReviewPageForm;