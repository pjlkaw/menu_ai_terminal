
// import pdf from 'pdf-parse'; // Extraí texto de arquivos PDF
// import officeparser from 'officeparser'; // Extraí texto de arquivos Word (.docx)
// import officegen from 'officegen'; // Gera arquivos Office (Word, Excel, PowerPoint)
import fs from 'fs'; // Leitura e escrita de arquivos no sistema de arquivos
import chalk from 'chalk'
import inquirer from 'inquirer'
import readlineSync from 'readline-sync'
// import open from 'open'
import Groq from 'groq-sdk' //AI
import dotenv from 'dotenv'
dotenv.config()

export async function documentosAI() {
    const { opcao }= await inquirer.prompt([
        {
            type: 'rawlist',
            name: 'opcao',
            message: `${chalk.cyan(' Documentos \n')}`,
            choices:['Anexar', new inquirer.Separator(), 'Criar', new inquirer.Separator(), 'Sair'] 
        }
    ]);

    //Anexo de arquivos
    if (opcao === 'Anexar') {
        console.log(chalk.gray("- É importante que o anexo deva estar em ./docs ! \n"));

        const arquivosPasta = fs.readdirSync('./docs')
        const arquivosPastaAtual = console.log("Arquivos da pasta atual\n",arquivosPasta);

        arquivosPastaAtual
        const { arquivo } = await inquirer.prompt([
            {
                type: 'list',
                name: 'arquivo',
                message: 'Escolha o arquivo ..:',
                choices: arquivosPasta
            }
        ])

        console.log(arquivo);
        


    }
    else if (opcao == 'Criar') {
        groqAI()
    }

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
