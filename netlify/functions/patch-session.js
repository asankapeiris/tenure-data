// netlify/functions/patch-session.js
exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST" && event.httpMethod !== "PATCH") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const API_KEY = process.env.AIRTABLE_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing Airtable API Key in environment variables." }) };
  }

  try {
    const payload = JSON.parse(event.body);
    const recordId = payload.recordId;
    
    if (!recordId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing Airtable recordId." }) };
    }

    // Isolate the specific row URL using the recordId passed from the frontend
    const url = `https://api.airtable.com/v0/appEtSfz6BDhJkdVW/tblAr37nL5AxVrXnS/${recordId}`;

    // Structure the data identically to Airtable's requirements
    const airtablePayload = {
      fields: payload.fields,
      typecast: payload.typecast
    };

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(airtablePayload)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error || "Airtable Patch Error" })
      };
    }

    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Backend API Call Failed: " + error.message }) };
  }
};
