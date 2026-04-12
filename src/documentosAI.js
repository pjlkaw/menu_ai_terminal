
import officeparser from 'officeparser' // Extraí texto de arquivos
// import officegen from 'officegen'; // Gera arquivos Office (Word, Excel, PowerPoint)
import fs from 'fs'; // Leitura e escrita de arquivos no sistema de arquivos
import chalk from 'chalk'
import inquirer from 'inquirer'
import stringsimilarity from 'string-similarity'
// import readlineSync from 'readline-sync'

import dotenv from 'dotenv'
dotenv.config()
import Groq from 'groq-sdk' //AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function documentosAI() {
    const { opcao }= await inquirer.prompt([
        {
            type: 'rawlist',
            name: 'opcao',
            message: `${chalk.cyan(' Documentos \n')}`,
            choices:['Anexar', new inquirer.Separator(), 'Criar', new inquirer.Separator(), 'Sair'] 
        }
    ]);

    const arquivosPasta = fs.readdirSync('./docs')
    const arquivosPastaAtual = console.log("Arquivos da pasta atual\n",arquivosPasta);

    //Anexo de arquivos
    if (opcao === 'Anexar') {
        console.log(chalk.gray("- É importante que o anexo deva estar em ./docs ! \n"));
        arquivosPastaAtual
        const { arquivo } = await inquirer.prompt([
            {
                type: 'list',
                name: 'arquivo',
                message: 'Escolha o arquivo ..:',
                choices: arquivosPasta
            }
        ])

        const caminho = `./docs/${arquivo}`

        officeparser.parseOffice(caminho, (data, err) => {
            if(err) {
                console.log(chalk.red("Erro ao ler arquivo"));
                return
            }
            let textoData = ''

            data.content.forEach(item => {
                if (item.text) {
                    textoData += item.text + "\n"
                }
            });

            console.log(textoData); //CONTEÚDO DO ARQUIVO

            groqAI("Resuma esse conteúdo: \n \n" + textoData)
        })
    }
    else if (opcao == 'Criar') {
        console.log('Indisponível');
        
    }

    function groqAI(content) {
        
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
                        content: `${content}`
                    },
                ],
                model: "openai/gpt-oss-20b",
            });
        }
        main()
    }
    
}
