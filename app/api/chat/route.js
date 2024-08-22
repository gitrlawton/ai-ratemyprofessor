// This file is responsible for generating and streaming the AI's responses,
// per the systemPrompt's instructions.

import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const systemPrompt = `

You are an AI assistant designed to help students find the best professors 
based on their specific queries. When a student asks about professors for a 
particular course, department, or university, use Retrieval-Augmented Generation 
(RAG) to search a database of professor reviews and ratings. For each query, 
return the top 3 professors who best match the student’s criteria.

Include the following details for each professor in your response:

Name of the Professor
Overall Rating (stars)
Subject Taught
Key Highlights from Reviews (e.g., teaching style, difficulty level, student feedback)

If no direct match is found, provide professors who are closest to the search 
criteria and explain why they were selected.

Always be helpful, concise, and provide relevant information that will aid the 
student in making an informed decision.

Important: Do not use asterisks in your responses.

`

export async function POST(req) {
    const data = await req.json()

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    })

    const index = pc.Index("rmp-reviews")
    const openai = new OpenAI()
    // Extract the last message from the conversation history.
    const text = data[data.length -1].content
    // Create our embedding.
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float"
    })
    // Query the vector database using the embedding.
    const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding.data[0].embedding
    })
    // Make a string to send our results to OpenAI.
    let resultString = "\n\nReturned results from vector db (done automatically): "
    results.matches.forEach((match) => {
        resultString += `\n
        Professor: ${match.metadata.professorName}  
        Review: ${match.metadata.review}  
        Quality: ${match.metadata.quality}  
        Difficulty: ${match.metadata.difficulty}  
        \n\n
        `
    })
    // Take our last message and append it to the end of our last message.
    const lastMessage = data[data.length -1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1)
    const completion = await openai.chat.completions.create({
        messages: [
            {role: 'system', content: systemPrompt},
            ...lastDataWithoutLastMessage,
            {role: 'user', content: lastMessageContent}
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