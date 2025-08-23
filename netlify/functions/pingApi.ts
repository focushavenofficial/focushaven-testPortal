// netlify/functions/pingApi.ts

import { Handler } from '@netlify/functions';

const handler: Handler = async () => {
  try {
    // Ping Supabase first
    console.log("Pinging Supabase...");
    const supabaseResponse = await fetch("https://rcfjprtdllvqymhkuewq.supabase.co/rest/v1/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY, // Using anon key for health check
      },
    });

    const supabaseData = await supabaseResponse.text();
    console.log("Supabase Response:", supabaseData);

    // Ping the existing API
    console.log("Pinging Focus Haven API...");
    const response = await fetch("https://focushaven-api.vercel.app/api/v1/uptime-keeper", {
      method: "GET", // or POST/PUT/DELETE etc.
      headers: {
        "Content-Type": "application/json",
        // Add any auth headers if needed
      },
    });

    const data = await response.json();

    // Log or process both responses
    console.log("Focus Haven API Response:", data);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "Both APIs pinged successfully", 
        supabase: {
          status: supabaseResponse.status,
          statusText: supabaseResponse.statusText
        },
        focusHavenApi: data 
      }),
    };
  } catch (error) {
    console.error("API ping failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "API ping failed", error: error.message }),
    };
  }
};

export { handler };
