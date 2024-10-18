const API_URL = '/api/generate-image';

export const generateAIImage = async (testResults) => {
  try {
    const prompt = generatePrompt(testResults);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

const generatePrompt = (results) => {
  // 여기에 실제 결과를 바탕으로 프롬프트를 생성하는 로직을 구현하세요
  return `Cybernetic implant system with L-shaped main module and 4 unique parts. MACHINE BUTCHER Corp branding. ${results.someProperty}`;
};

export { generatePrompt };