// controllers/aiController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateProductDesign = async (req, res) => {
  try {
    const { productImage, prompt } = req.body;

    if (!productImage) {
      return res.status(400).json({ success: false, message: 'Product image is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const fullPrompt = prompt || 
      "Generate a high-quality fashion model image wearing the uploaded product, studio lighting, elegant background.";

    const result = await model.generateContent([
      { role: 'user', parts: [
        { text: fullPrompt },
        { inlineData: { mimeType: 'image/png', data: productImage } }
      ] }
    ]);

    const imageBase64 = result.response.candidates[0].content.parts[0].inlineData.data;

    res.json({ success: true, image: imageBase64 });
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
