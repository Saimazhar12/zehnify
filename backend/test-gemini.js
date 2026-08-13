require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testAI() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_KEY;
    if (!apiKey) {
        console.error('Error: GEMINI_API_KEY not found in .env');
        process.exit(1);
    }

    console.log(`Testing Gemini API with key: ${apiKey.substring(0, 5)}...`);

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
            contents: 'Say hello in one sentence.',
            config: {
                maxOutputTokens: 100,
            },
        });

        console.log('Response:', response.text ?? '(no text)');
    } catch (error) {
        console.error('Gemini API Error:', error.message);
        process.exit(1);
    }
}

testAI();
