const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy call to check connectivity
    console.log("Checking connectivity...");
    // The SDK doesn't have a direct listModels in the simple client sometimes, 
    // but we can try a few names.
  } catch (e) {
    console.error(e.message);
  }
}

listModels();
