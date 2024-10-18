const API_URL = process.env.REACT_APP_API_URL || '/api';

export const generateAIImage = async (testResults) => {
  try {
    const prompt = generatePrompt(testResults);
    const response = await fetch(`${API_URL}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

const generatePrompt = (results) => {
  // 프롬프트 생성 로직...
  return `Cybernetic implant system with L-shaped main module and 4 unique parts. MACHINE BUTCHER Corp branding. ${results.someProperty}`;
};

export { generatePrompt };