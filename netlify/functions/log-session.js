// netlify/functions/log-session.js
exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Pull the Airtable key from Netlify Environment
  const API_KEY = process.env.AIRTABLE_API_KEY; 
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing Airtable API Key in environment variables." }) };
  }

  // The base ID and Table ID match your frontend routing
  const url = "https://api.airtable.com/v0/appEtSfz6BDhJkdVW/tblAr37nL5AxVrXnS";

  try {
    // The frontend sends { fields: {...}, typecast: true }
    const payload = JSON.parse(event.body);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        statusCode: response.status, 
        body: JSON.stringify({ error: data.error || "Airtable API Error" }) 
      };
    }
    
    // Returns the Airtable response (including the record ID) back to the frontend
    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Backend API Call Failed: " + error.message }) };
  }
};
