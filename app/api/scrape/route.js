import { Pinecone } from '@pinecone-database/pinecone';
import { scrapeRateMyProfessorPage } from '@/utils/scrapeRateMyProfessorPage';
import OpenAI from 'openai';

export async function POST(request) {
  const { url } = await request.json();

  try {
    // Scrape the data from the provided URL
    const scrapedData = await scrapeRateMyProfessorPage(url);
    console.log('Scraped Data:', JSON.stringify(scrapedData, null, 2));

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Pinecone client
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    // Select the index
    const index = pinecone.Index('rmp-reviews');

    // Process the scraped data
    const processedData = await Promise.all(scrapedData.reviews.map(async (review, idx) => {
      // Create embedding using OpenAI
      const response = await openai.embeddings.create({
        input: review,
        model: "text-embedding-3-small"
      });

      const embedding = response.data[0].embedding;

      return {
        values: embedding,
        id: `${scrapedData.professorName}_${idx}`, // Using professor name and index as ID
        metadata: {
          review: review,
          professorName: scrapedData.professorName,
          quality: scrapedData.ratingsQuality[idx],
          difficulty: scrapedData.ratingsDifficulty[idx]
        }
      };
    }));

    // Upsert the processed data to Pinecone
    await index.upsert(processedData, { namespace: "ns1" });

    // Send a success response
    return new Response(JSON.stringify({ message: 'Data successfully processed and added to Pinecone' }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    // Handle errors and send an error response
    return new Response(JSON.stringify({ error: 'Failed to process the data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}




















