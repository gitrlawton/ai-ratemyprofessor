
// analyze/route.js
import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const systemPrompt = `
You are an AI assistant analyzing professor reviews.
Please summarize the sentiment and identify trends based on the reviews provided.
Format the result clearly, stating the overall sentiment and any noticeable trends over time.
Do not fabricate information.

`;

export async function POST(req) {
    const { professorName } = await req.json();

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    });

    const index = pc.index('rmp-reviews');
    const openai = new OpenAI();

    const text = `
        You are an AI assistant analyzing professor reviews.
        `
    console.log("text: ", text)
    // Create our embedding.
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float"
    })

    // Query Pinecone for reviews of the specified professor
    const queryOptions = {
        topK: 200,
        includeMetadata: true,
        vector: embedding.data[0].embedding,
        filter: { professorName: professorName }
    };


    const results = await index.query(queryOptions);
    
    console.log("Index query results:", JSON.stringify(results.matches, null, 2));

    // Make a string to send our results to OpenAI.
    let resultString = "\n\nReturned results from vector db (done automatically): "

    // For my scraped data [COMMENT IN/OUT]
    results.matches.forEach((match) => {
        resultString += `\n
        Professor: ${match.metadata.professorName}
        Course: ${match.metadata.course}   
        Review: ${match.metadata.review}  
        Date: ${match.metadata.date}  
        \n\n
        `
    })

    const messageContent = `
        Please summarize the students' opinions of the professor.
        Format the result clearly, stating the overall sentiment and any noticeable trends over time.
        Mention how the opinion of students have changed over time, citing dates where sentiment changed.
        Do not fabricate information.  
        Use the reviews to provide insights that might be value to students, including teaching style.
        Important: Do not use asteriks (*) or other special characters, such as # in your sentences.
    ` + resultString;

    const completion = await openai.chat.completions.create({
        messages: [
            {role: 'system', content: systemPrompt},
            {role: 'user', content: messageContent}
        ],
        model: 'gpt-4o-mini',
        stream: true
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch (err) {
                controller.error(err)
            }
            finally {
                controller.close()
            }
        }
    })

    return new NextResponse(stream);
}
