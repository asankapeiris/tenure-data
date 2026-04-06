exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Parse the incoming request from your frontend
  const { systemPrompt, userMessage } = JSON.parse(event.body);
  
  // Pull the secure API key from Netlify's environment variables
  const API_KEY = process.env.GEMINI_API_KEY; 

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    const requestBody = {
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { temperature: 0 }
    };
    
    if (systemPrompt && systemPrompt.trim() !== "") {
      requestBody.system_instruction = { parts: [{ text: systemPrompt }] };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    // Send the AI's response back to the frontend
    return { 
        statusCode: 200, 
        body: JSON.stringify(data) 
    };

  } catch (error) {
    return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Backend API Call Failed" }) 
    };
  }
};