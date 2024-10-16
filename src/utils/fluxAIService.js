const generatePrompt = (results) => {
  // 단순화된 프롬프트
  return "Cybernetic implant system with L-shaped main module and 4 unique parts. MACHINE BUTCHER Corp branding.";
};

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const generateAIImage = async (testResults) => {
  try {
    const prompt = generatePrompt(testResults);  // generatePrompt 함수 사용
    const response = await fetch(`${API_URL}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, testResults }),  // prompt를 요청 본문에 포함
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// generatePrompt 함수를 내보내 다른 파일에서도 사용할 수 있게 함
export { generatePrompt };