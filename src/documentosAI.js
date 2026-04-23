
import officeparser from 'officeparser' // Extraí texto de .docx
import pdf from 'pdf-parse-fork'; // Extraí texto de .pdf
// import exceljs from 'exceljs' // Extraí arquivo .xlsx

// import pptxgenjs from "pptxgenjs"; // criar pptx e extrai conteúdo☻
// import docx from "docx"; // criar docx
// import exceljs from "exceljs"; // criar xlsx

import fs from 'fs'; // Leitura e escrita de arquivos no sistema de arquivos
import chalk from 'chalk'
import inquirer from 'inquirer'
import stringSimilarity from 'string-similarity'
import readlineSync from 'readline-sync'
// .env e Groq
import dotenv from 'dotenv'
dotenv.config()
import Groq from 'groq-sdk' //AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function documentosAI() {
    while(true) {
        const { opcao }= await inquirer.prompt([
            {
                type: 'rawlist',
                name: 'opcao',
                message: `${chalk.cyan('\nDocumentos \n')}`,
                choices:['Anexar', new inquirer.Separator(), 'Criar', new inquirer.Separator(), 'Sair'] 
            }
        ]);
        
        //Anexo de arquivos
        if (opcao === 'Anexar') { // ==================== ADICIONAR SUPORTE PARA -> .TXT .PDF .XLSX .PDF
            console.log(chalk.gray("- É importante que o anexo deva estar em ./docs !"));
            const arquivosPasta = fs.readdirSync('./docs')

            console.log(chalk.yellowBright("Comandos:"));
            console.log(chalk.magentaBright(
                "/resume - /free - /list - /back - /end"
            ));
            const { input } = await inquirer.prompt([
                {
                    type: 'list',
                    message: 'O que deseja fazer com o arquivo?',
                    name: 'input',
                    choices: ['/resume', '/free', '/list', '/back', '/end']
                }
            ])
    
            if (input === "/back") {
                continue
            }
            else if (input === "/end") {
                return
            }
    
            else if (input === "/resume") {
                const caminho = await escolheArquivo(arquivosPasta)
                await resumeDoc(caminho)
            }

            else if (input === "/free") {
                const caminho = await escolheArquivo(arquivosPasta)
                await freeDoc(caminho)
            }

            else if (input === "/list") {
                const caminho = await escolheArquivo(arquivosPasta)
                await listDoc(caminho)
            }
        }
        
        //CRIAR ARQUIVO
        else if (opcao == 'Criar') {
            console.log(chalk.gray("- O arquivo será criado em ./docs !"));
            let tipoArquivo = '.txt' //tipo padrão -> .txt //IDEIA DE USAR TIPO COMO PARÂMETRO
            const { choice } = await inquirer.prompt([
                {
                    type: 'rawlist',
                    message: 'Criar arquivo de ..:',
                    name: 'choice',
                    choices: ['Texto', 'Word', 'Excel', 'PowerPoint', '-Sair-']
                }
            ])
            if (choice === "-Sair-") return
    
            const nomeArquivo = readlineSync.question('Defina um nome para o arquivo ..: ')


        if (choice === "Word") {
            tipoArquivo = ".docx"
        }
        else if (choice === "Excel") {
            tipoArquivo = ".xlsx"
        }
        else if (choice === "PowerPoint") {
            tipoArquivo = ".pptx"
        }    

            const caminhoArquivo = "./docs/"+nomeArquivo+tipoArquivo
            console.log(caminhoArquivo);
            fs.writeFile(caminhoArquivo, "oi", (err) => {
                if (err) console.log(err)
            })
        }
        
        else if (opcao == 'Sair') {
            return
        }

    }


    //FUNCTIONS ============
    async function groqAI(content) {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: content
                },
            ],
            model: "openai/gpt-oss-20b",
        });

        return chatCompletion.choices[0]?.message?.content || "";
    }
    
    //Lê o arquivo baseado no tipo e responde com IA
    async function promptDoc(caminho, prompt) {

        if (caminho.endsWith('.txt')) {
            const conteudo = fs.readFileSync(caminho, "utf-8")
            const resposta = await groqAI(prompt + '\n\nconteúdo do txt:\n' + conteudo)
            return resposta
        }

        else if (caminho.endsWith('.docx')) {
            return new Promise((resolve, reject) => {
                officeparser.parseOffice(caminho, async (data, err) => {
                    if(err) {
                        console.log(chalk.red("Erro ao ler arquivo"));
                        return reject(err)
                    }
                    let textoData = ''
    
                    //envia separadamente o texto para textoData
                    data.content.forEach(item => {
                        if (item.text) {
                            textoData += item.text + "\n"
                        }
                    });
    
                    //Prompt AI
                    const resposta = await groqAI(prompt  + "\n\nconteúdo do docx:\n" + textoData)
                    resolve(resposta)
    
                })
            })
        }

        else if (caminho.endsWith('.pdf')) {
            const dataBuffer = fs.readFileSync(caminho);
            const data = await pdf(dataBuffer); // Extração simples de texto
            const textoReduzido = data.text.substring(0, 15000);
            return await groqAI(prompt + "\n\nconteúdo do pdf:\n" + textoReduzido);
        }
    }

    async function escolheArquivo(arquivosPasta) { // retorna o caminho
        console.log("\nArquivos da pasta atual:\n",arquivosPasta);

        const { arquivo } = await inquirer.prompt([
            {
                type: 'input',
                name: 'arquivo',
                message: `${chalk.magenta(`Escolha o arquivo ..:`)}`,
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
                console.log(chalk.yellow(`\nArquivo '${arquivo}' não encontrado!`));
                console.log(chalk.yellow(`Você quis dizer: '${sugestao}' ?`))
                
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
        return caminho
    }

    //FUNÇÕES DO MODO ANEXAR

    async function resumeDoc(caminho) {
        const promptUsuario = "resuma"
        const resposta = await promptDoc(caminho, promptUsuario)
        console.log(chalk.magenta(`${chalk.gray('Lumin: \n')}` + resposta))
    }
    async function freeDoc(caminho) {
        const promptUsuario = readlineSync.question(chalk.green('\nO que gostaria de fazer com o arquivo? '))
        const resposta = await promptDoc(caminho, promptUsuario)

        
        console.log(chalk.magenta(`${chalk.gray('Lumin:')}` + resposta))
    }
    async function listDoc(caminho) {
        const promptUsuario = '\n resuma o conteúdo em listas'
        const resposta = await promptDoc(caminho, promptUsuario)
        console.log(chalk.magenta(`${chalk.gray('Lumin:')}` + resposta))
    }





    //FUNÇOES DO MODO CRIAR

}
