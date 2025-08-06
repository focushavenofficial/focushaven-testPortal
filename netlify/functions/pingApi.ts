// netlify/functions/pingApi.ts

import { Handler } from '@netlify/functions';

const handler: Handler = async () => {
  try {
    const response = await fetch("https://your-api-endpoint.com/data", {
      method: "GET", // or POST/PUT/DELETE etc.
      headers: {
        "Content-Type": "application/json",
        // Add any auth headers if needed
      },
    });

    const data = await response.json();

    // Log or process the data
    console.log("API Response:", data);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "API call successful", data }),
    };
  } catch (error) {
    console.error("API call failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "API call failed", error }),
    };
  }
};

export { handler };
