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
            model: "mixtral-8x7b-32768",
            // temperature: 0,
            // maxTokens: undefined,
            // maxRetries: 2,
        });

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant. Answer all questions to the best of your ability."],
            ["placeholder", "{messages}"],
            ["human", "{input}"],
        ]);
        const outputParser = new StringOutputParser();
        const chain = prompt.pipe(model).pipe(outputParser);
        console.log('chain created successfully');
      
        const stream = await chain.stream({ input,messages });
        
        console.log('Stream generated successfully:', stream);

        return new StreamingTextResponse(stream);
  
    } catch (error) {
        console.error('Error in POST function:', error);
        return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
    }
}
