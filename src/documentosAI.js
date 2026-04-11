
// import pdf from 'pdf-parse'; // Extraí texto de arquivos PDF
// import officeparser from 'officeparser'; // Extraí texto de arquivos Word (.docx)
// import officegen from 'officegen'; // Gera arquivos Office (Word, Excel, PowerPoint)
// import fs from 'fs'; // Leitura e escrita de arquivos no sistema de arquivos
import Groq from 'groq-sdk' //AI
import dotenv from 'dotenv'
dotenv.config()

export async function documentosAI() {
    console.log("ok");
    
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    
    async function main() {
        const chatCompletion = await getGroqChatCompletion();
        // Print the completion returned by the LLM.
        console.log(chatCompletion.choices[0]?.message?.content || "");
        }

    async function getGroqChatCompletion() {
    return groq.chat.completions.create({
        messages: [
        {
            role: "user",
            content: "Explain the importance of fast language models",
        },
        ],
        model: "openai/gpt-oss-20b",
    });
    }
    main()


}