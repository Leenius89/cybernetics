import Cors from 'cors';
import initMiddleware from '../../lib/init-middleware';
import Replicate from 'replicate';

const cors = initMiddleware(
  Cors({
    methods: ['POST', 'OPTIONS'],
  })
);

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('Received request:', req.body);
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Using API token:', process.env.REPLICATE_API_TOKEN ? 'Set' : 'Not set');
    
    const input = { prompt };

    console.log('Sending request to Replicate API:', input);

    const output = await replicate.run(
      "black-forest-labs/flux-schnell:7adaee263f8313a267e7bba9892528d50a0a64b9f309e03f6c903aaf991529f2",
      { input }
    );
    
    console.log('Replicate API response:', output);
    
    if (!Array.isArray(output) || output.length === 0) {
      throw new Error('Invalid response from Replicate API');
    }

    res.status(200).json({ imageUrl: output[0] });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ 
      error: 'Failed to generate image', 
      details: error.message
    });
  }
}