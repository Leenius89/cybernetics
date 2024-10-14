const Replicate = require('replicate');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('Received request:', req.body);
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Using API token:', process.env.REPLICATE_API_TOKEN ? 'Set' : 'Not set');
    
    const input = { 
      prompt,
      num_outputs: 1,
      go_fast: true,
      megapixels: "1",
      aspect_ratio: "1:1",
      output_format: "png",
      num_inference_steps: 4
    };

    console.log('Sending request to Replicate API:', input);

    const output = await replicate.run(
      "black-forest-labs/flux-schnell:7adaee263f8313a267e7bba9892528d50a0a64b9f309e03f6c903aaf991529f2",
      { input }
    );
    
    console.log('Replicate API response:', output);
    
    if (!Array.isArray(output) || output.length === 0) {
      throw new Error('Invalid response from Replicate API');
    }

    res.json({ imageUrl: output[0] });
  } catch (error) {
    console.error('Error generating image:', error);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Failed to generate image', 
      details: error.message,
      apiResponse: error.response ? error.response.data : undefined
    });
  }
};