const generateAIImage = async (prompt) => {
  try {
    const response = await fetch('/api/generate-image', {
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
    console.error('Error generating image:', error);
    throw error;
  }
};

const generatePrompt = (results) => {
  return `Cybernetic implant system with L-shaped main module and 4 unique parts. MACHINE BUTCHER Corp branding. ${results.someProperty}`;
};

export { generatePrompt };