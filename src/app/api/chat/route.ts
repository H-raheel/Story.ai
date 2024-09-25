import { StringOutputParser, } from "@langchain/core/output_parsers";
import {
    ChatPromptTemplate
} from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { StreamingTextResponse } from 'ai';

export const runtime = 'edge';
export async function POST(req: Request) {
    try {
        const { input, messages } = await req.json();
        console.log('Received input:', input);
        console.log('Received messages:', messages);

        const model = new ChatGroq({
           apiKey:process.env.GROQ_API_KEY,
            model: "llama3-8b-8192",
            temperature: 0.2,
            streaming:true,
            // maxTokens: undefined,
            // maxRetries: 2,
        });

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are a story writing expert.Given the current story, continue the story with one sentence only.Make sure that the continuation to the story  is smooth. Do not repeat the users part.The age of the user is {age} years. So keep the vocabulary and sentences appropriate very easy.The topic of the story is {topic}"],
            ["placeholder", "{messages}"],
            ["human", "{input}"],

        ]);
        const topic="wonderful day";
        const age=7;
        const outputParser = new StringOutputParser();
        const chain = prompt.pipe(model).pipe(outputParser);
        console.log('chain created successfully');
      
        const stream = await chain.stream({ input,messages,topic,age });
        
        console.log('Stream generated successfully:', stream);

        return new StreamingTextResponse(stream);
  
    } catch (error) {
        console.error('Error in POST function:', error);
        return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
    }
}
