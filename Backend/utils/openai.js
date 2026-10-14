import "dotenv/config";
import { OpenAI } from "openai";

const getOpenAIClient = () => {
    return new OpenAI({     
        apiKey: process.env.GEMINI_API_KEY,  
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", 
    }); 
}; 

export const createThread = async() => {
    const client = getOpenAIClient(); 
    const thread = await client.beta.threads.create(); 
    return thread.id; 
}; 

export const getUserThread = async(userId) => {
    const client = getOpenAIClient(); 
    const thread = await client.beta.threads.create(); 
    return thread.id; 
};  

export const getMessages = async(threadId) => {
    const client = getOpenAIClient(); 
    const messages = await client.beta.threads.messages.list(threadId); 
    return messages.data; 
};

export const addMessage = async(threadId, role, content) => {
    const client = getOpenAIClient(); 
    const message = await client.beta.threads.messages.create(threadId, { role, content }); 
    return message; 
};

export const createRun = async(threadId, model = "gemini-3.8-flash") => {
    const client = getOpenAIClient(); 
    const run = await client.beta.threads.runs.create(threadId, { model }); 
    return run.id; 
};

export const getRunStatus = async(threadId, runId) => {
    const client = getOpenAIClient(); 
    const run = await client.beta.threads.runs.retrieve(threadId, runId); 
    return run.status; 
};

export const getRunSteps = async(threadId, runId) => {
    const client = getOpenAIClient(); 
    const steps = await client.beta.threads.runs.steps.list(threadId, runId); 
    return steps.data; 
};    


export default getOpenAIClient; 