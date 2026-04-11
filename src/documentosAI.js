
// import pdf from 'pdf-parse'; // Extraí texto de arquivos PDF
// import officeparser from 'officeparser'; // Extraí texto de arquivos Word (.docx)
// import officegen from 'officegen'; // Gera arquivos Office (Word, Excel, PowerPoint)
// import fs from 'fs'; // Leitura e escrita de arquivos no sistema de arquivos
import inquirer from 'inquirer'
import readlineSync from 'readline-sync'
import open from 'open'
import Groq from 'groq-sdk' //AI
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
dotenv.config()

export async function documentosAI() {
    let input = ''

    while (true) {
        input =  readlineSync.question('')

        if (input === "/end") {
            return
        }

        console.log("ok");
        
        inquirer.prompt([{
            type: 'file',
            name: 'arquivo',
            message: 'Selecione um arquivo:',
            default: ''
            }]).then(answers => {
            console.log('Arquivo selecionado:', answers.arquivo);
            // faça algo com o arquivo selecionado
        });
    
    
        function groqAI() {
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

    }
   


}