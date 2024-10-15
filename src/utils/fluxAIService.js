const generatePrompt = (results) => {
  // 단순화된 프롬프트
  return "Cybernetic implant system with L-shaped main module and 4 unique parts. MACHINE BUTCHER Corp branding.";
};

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const generateAIImage = async (testResults) => {
  try {
    const response = await fetch(`${API_URL}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testResults }),
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