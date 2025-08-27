// netlify/functions/pingApi.ts

import { Handler } from '@netlify/functions';

const handler: Handler = async () => {
  try {
    // Ping Supabase first
    console.log("Pinging Supabase...");
    const supabaseResponse = await fetch("https://ipbkceewkwlcivqrjufi.supabase.co/rest/v1/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.VITE_SUPABASE_ANON_KEY || "fallback-key", // Using anon key for health check
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
    console.log("Focus Haven API Response:", data);

    //Ping AFKBot
    console.log("Pinging AFK BOT Server API...");
    const BotResponce = await fetch("https://minecraft-afkbot-q3to.onrender.com/start-bot", {
      method: "GET"
    })

    const botData = await BotResponce.json();
    console.log("BOT API resopnse: ",BotData);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "Both APIs pinged successfully", 
        supabase: {
          status: supabaseResponse.status,
          statusText: supabaseResponse.statusText
        },
        focusHavenApi: data ,
        botApi: botData
      }),
    };
  } catch (error) {
    console.error("API ping failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "API ping failed", error: error instanceof Error ? error.message : String(error) }),
    };
  }
};

export { handler };
