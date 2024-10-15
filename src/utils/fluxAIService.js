const generatePrompt = (results) => {
  // 단순화된 프롬프트
  return "Cybernetic implant system with L-shaped main module and 4 unique parts. MACHINE BUTCHER Corp branding.";
};

export const generateAIImage = async (testResults) => {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testResults }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('API response:', text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data.imageUrl;
    } else {
      const text = await response.text();
      console.error('Unexpected content type:', contentType);
      console.error('Response body:', text);
      throw new Error('Unexpected content type from API');
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};