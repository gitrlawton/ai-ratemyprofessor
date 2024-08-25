// This file is responsible for generating and streaming the AI's responses,
// per the systemPrompt's instructions.

import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const systemPrompt = `

You are an AI assistant that helps users with professor reviews. 
When answering queries, use ONLY the information provided.
If the provided information is not sufficient to answer the query, say so.  
Do not make up or hallucinate any information not present in the retrieved reviews.
Format your response as follows:
1. Restate the user's query.
2. Provide your answer based solely on the retrieved reviews.
3. If you can't answer based on the retrieved information, clearly state that.

Include the following details for each professor in your response:

Name of the Professor
Rating(s) (in stars)
Course Taught
The Review

Important: Do not use asterisks in your responses.

`

export async function POST(req) {
    const data = await req.json()

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    })

    const index = pc.index("rmp-reviews")//.namespace('ns1')
    const openai = new OpenAI()

  // Extract 'query' and 'text' from the data
  const { params } = data[0];  
  console.log("params: ", params)
  const { professorName, course, difficulty } = params || {};

    // Extract the last message from the conversation history.
    const text = data[data.length -1].content
    // Create our embedding.
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float"
    })

    // Build the dynamic filter object
    const filter = {};
    if (professorName) filter.professorName = professorName;
    if (course) filter.course = course;
    if (difficulty) filter.difficulty = Number(difficulty);
    console.log("difficulty: ", difficulty)
    console.log("filter: ", filter)

    // Query the vector database using the embedding.
    const results = await index.query({
        topK: 5,
        includeMetadata: true,
        vector: embedding.data[0].embedding,
        // Dynamic filter
        filter: filter 
    })

    console.log("Index query results:", JSON.stringify(results.matches, null, 2));

    // Make a string to send our results to OpenAI.
    let resultString = "\n\nReturned results from vector db (done automatically): "

    // For my scraped data [COMMENT IN/OUT]
    results.matches.forEach((match) => {
        resultString += `\n
        Professor: ${match.metadata.professorName}
        Course: ${match.metadata.course}   
        Review: ${match.metadata.review}  
        Quality: ${match.metadata.quality}  
        Difficulty: ${match.metadata.difficulty}  
        \n\n
        `
    })

    // // For my mock data [COMMENT IN/OUT]
    // results.matches.forEach((match) => {
    //     resultString += `\n
    //     Professor: ${match.id}
    //     Review: ${match.metadata.review}
    //     Course: ${match.metadata.course}
    //     Stars: ${match.metadata.stars} 
    //     \n\n
    //     `
    // })

    // Take our last message and append it to the end of our last message.
    const lastMessage = data[data.length -1]
    const lastMessageContent = lastMessage.content + resultString
    console.log("Last message content log: " + lastMessageContent); // Logging.
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