
import officeparser from 'officeparser' // Extraí texto de arquivos
// import officegen from 'officegen'; // Gera arquivos Office (Word, Excel, PowerPoint)
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
        console.log(chalk.gray("- É importante que o anexo deva estar em ./docs !"));

        const input = readlineSync.question(chalk.cyanBright(
            `           ${chalk.magenta("Comandos:")}
            /resume
            /prompt (--Indisponível--)
            /list (--Indisponível--)
            /end 
            ${chalk.magenta('-----------')}
            ${chalk.magenta('..:')}`
        ))

        if (input === "") {
            return
        }

        else if (input === "/end") {
            return
        }

        else if (input === "/resume") {
            const caminho = await escolheArquivo()
            await resumeDoc(caminho)
            async function resumeDoc(caminho) {
                const promptUsuario = "resuma"
                const resposta = await promptDoc(caminho, promptUsuario)
                console.log(resposta)
            }
        }

        
    }
    
    //CRIAR ARQUIVO
    else if (opcao == 'Criar') {
        console.log('Indisponível');
    }
    
    else if (input === "/free") {
        return
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
    
    //Lê o arquivo e responde com IA
    async function promptDoc(caminho, prompt) {
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
                const resposta = await groqAI(prompt  + "\n\nconteúdo:\n" + textoData)
                resolve(resposta)

            })
        })
    }

    async function escolheArquivo() {
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
                console.log('Arquivo não encontrado!');
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
        return caminho
    }

}
