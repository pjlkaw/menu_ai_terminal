
import officeparser from 'officeparser' // Extraí texto de arquivos
// import officegen from 'officegen'; // Gera arquivos Office (Word, Excel, PowerPoint)
import fs from 'fs'; // Leitura e escrita de arquivos no sistema de arquivos
import chalk from 'chalk'
import inquirer from 'inquirer'
import stringSimilarity from 'string-similarity'
import readlineSync from 'readline-sync'

import dotenv from 'dotenv'
dotenv.config()
import Groq from 'groq-sdk' //AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function documentosAI() { //================ORGANIZAR CÓDIGO E ADICIONAR WHILE=====================
    const { opcao }= await inquirer.prompt([
        {
            type: 'rawlist',
            name: 'opcao',
            message: `${chalk.cyan(' Documentos \n')}`,
            choices:['Anexar', new inquirer.Separator(), 'Criar', new inquirer.Separator(), 'Sair'] 
        }
    ]);

    const arquivosPasta = fs.readdirSync('./docs')

    //Anexo de arquivos
    if (opcao === 'Anexar') {
        console.log(chalk.gray("- É importante que o anexo deva estar em ./docs ! \n"));

        const input = readlineSync.question(chalk.cyanBright(
            `
            ${chalk.magenta("Comandos:")}
            /resume
            /prompt (--Indisponível--)
            /list (--Indisponível--)
            /end 
            ..:
            `
        ))

        if (input === "") {
            return
        }

        if (input === "/end") {
            return
        }

        if (input === "/resume") {
            resumeDoc()
        }

        async function resumeDoc() {
            console.log("\nArquivos da pasta atual\n",arquivosPasta);

            const { arquivo } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'arquivo',
                    message: `${chalk.magenta('Escolha o arquivo ..:')}`,
                    choices: arquivosPasta
                }
            ]);
    
            let arquivoFinal = arquivo
            let caminho = `./docs/${arquivoFinal}`
            
            //SUGESTÂO DE ARQUIVO
            if (!fs.existsSync(caminho)) {
                const match = stringSimilarity.findBestMatch(arquivo, arquivosPasta)
                const sugestao = match.bestMatch.target
                const score = match.bestMatch.rating
                if (score > 0.4) {
                    console.log('Arquivo não encontrado');
                    console.log(`Você quis dizer: ${sugestao}?`)
                    
                    const { confirmar } = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'confirmar',
                            message: 'Usar este arquivo?',
                            default: true
                        }
                    ]); 
    
                    if (confirmar) {
                        arquivoFinal = sugestao
                        caminho = `./docs/${arquivoFinal}`
                    } 
                    
                }
                else {
                    console.log(chalk.red('Operação cancelada'))
                    return
                }
            }

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
    
                // console.log(textoData); //CONTEÚDO DO ARQUIVO
    
                groqAI("resuma em no máximo 2 parágrafos"  + " esse conteúdo: \n \n" + textoData)
            })
            
        }

    }


    //CRIAR ARQUIVO
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
