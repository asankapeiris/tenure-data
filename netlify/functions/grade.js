exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { systemPrompt, userMessage } = JSON.parse(event.body);
  
  // Pull infrastructure configs from Netlify Environment
  const API_KEY = process.env.GEMINI_API_KEY; 
  // Priority: Netlify Env Var -> Fallback to a stable default
  const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite"; 

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
    const requestBody = {
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { 
        temperature: 0,
        responseMimeType: "application/json"
      }
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
    
    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Backend API Call Failed" }) };
  }
};
