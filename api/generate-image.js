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
    
    const input = {
      prompt: prompt,
      hf_lora: "alvdansen/frosting_lane_flux"
    };

    console.log('Sending request to Replicate API:', input);

    const output = await replicate.run(
      "lucataco/flux-schnell-lora:2a6b576af31790b470f0a8442e1e9791213fa13799cbb65a9fc1436e96389574",
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