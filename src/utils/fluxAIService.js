const generatePrompt = (results) => {
  // 단순화된 프롬프트
  return "Cybernetic implant system with L-shaped main module and 4 unique parts. MACHINE BUTCHER Corp branding.";
};

export const generateAIImage = async (results) => {
  try {
    const prompt = generatePrompt(results);
    console.log('Generated prompt:', prompt);

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (data.status === 'succeeded') {
      return data.imageUrl;
    } else {
      console.log('Image generation in progress. Status:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};