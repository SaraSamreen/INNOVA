// test-gemini.js - Test your Gemini API key and list available models
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  console.log('Testing Gemini API...\n');
  
  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    console.log('Create a .env file with: GEMINI_API_KEY=your_key_here');
    return;
  }
  
  console.log('✅ API Key found:', process.env.GEMINI_API_KEY.substring(0, 15) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ GoogleGenerativeAI initialized\n');
    
    // List all available models
    console.log('📋 Fetching available models...\n');
    
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-pro',
      'gemini-1.0-pro',
      'gemini-1.0-pro-latest'
    ];
    
    console.log('Testing models:\n');
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelName.padEnd(30)} - WORKS!`);
      } catch (error) {
        console.log(`❌ ${modelName.padEnd(30)} - ${error.message.substring(0, 50)}...`);
      }
    }
    
    console.log('\n🎉 Test complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Invalid API key');
    console.error('2. Network/firewall blocking Google APIs');
    console.error('3. API key restrictions');
    console.error('\nGet a new key at: https://aistudio.google.com/app/apikey');
  }
}

testGemini();