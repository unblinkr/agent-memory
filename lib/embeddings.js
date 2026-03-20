// NVIDIA embeddings for semantic search
async function generateEmbedding(text) {
  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'nvidia/nv-embedqa-e5-v5',
        encoding_format: 'float',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`NVIDIA API error: ${error.detail || response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

export { generateEmbedding };
