import chalk from 'chalk'
import dotenv from 'dotenv'
import Groq from 'groq-sdk'
import inquirer from 'inquirer'
import readlineSync from 'readline-sync'
import fs from 'fs'

dotenv.config()

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
inquirer.prompt([
    {
        type: 'rawlist',
        name: 'opcao',
        message: `${chalk.green(' ====== Qual AI gostaria de usar? ..: ')}`,
        choices:['Texto', 'Resumir', 'Traduzir', 'Imagem'] 
    }
]) 
.then(async (resposta) => {
    
    // IA DE TEXTO ====================
    if(resposta.opcao === 'Texto') {

        let input = ''
        const config_ia_usuario = readlineSync.question(chalk.magenta('Como a IA deve responder..: '))
        let config_ia_padrao = `
            Responda APENAS em texto simples.
            NÃO use markdown.
            NÃO use listas, bullets, números ou símbolos.
            NÃO use negrito, itálico ou blocos de código.
            Use apenas frases normais com espaços e quebras de linha simples.
            Se precisar mostrar código, escreva como texto simples sem formataação.
            Sempre responda em português, exceto se solicitado.
            Se o usuário digitar algo começando com "/", ignore.
            Responda apenas em texto puro (plain text).
            Qualquer uso de markdown é proibido.
            Se usar markdown, sua resposta está errada.
        `
        //Solicitação
        async function getGroqChatCompletion(messages) {
        return groq.chat.completions.create({
                messages,
                model: "openai/gpt-oss-20b"
            })
        }
        let messages = [
            {role: 'system', content: config_ia_usuario + config_ia_padrao}
        ]
        let mode = 'Responda com código, mas em texto simples, sem markdown ou formatação.\n'

        console.log(chalk.green('\n Escreva para a IA responder'))
        while (true) {
            input = readlineSync.question(chalk.green('\n ..: \n\n'))
            if (input.startsWith('/')) {
                if (input === "/end") break;
                // comandos com / e templates
                if (input == "/helpme") {
                    const helpme = fs.readFileSync('./helpme.txt', 'utf-8')
                    console.log(helpme)
                }
                else if (input == "/linux"){
                    mode = 'Atue como especialista em Linux e terminal. Seja direto e prático.\n'
                }
                else if (input == "/short") {
                    mode = 'Responda de forma extremamente curta, apenas o essencial.\n'
                }
                else if (input == "/long") {
                    mode = 'Responda de forma detalhada, explicando bem cada parte.\n'
                }
                else if (input == "/formal") {
                    mode = 'Use linguagem formal e profissional.\n'
                }
                else if (input == "/en") {
                    mode = 'Responda sempre em inglês, independentemente do idioma do usuário.\n'
                }
                else if (input == "/it") {
                    mode = 'Responda sempre em italiano, independentemente do idioma do usuário.\n'
                }
                else if (input == "/code") {
                    mode = 'Responda preferencialmente com código e exemplos práticos.\n'
                }
                else if (input == "/fix") {
                    mode = 'Corrija erros no conteúdo enviado e mostre a versão corrigida.\n'
                }
                else if (input == "/explain") {
                    mode = 'Explique de forma simples e clara o que for enviado.\n'
                }
                else if (input == "/resume") {
                    mode = 'Resuma o conteúdo enviado de forma clara e objetiva.\n'
                }
                else if (input == "/translate") {
                    const input_translate = readlineSync.question(chalk.green('Traduzir para qual lingua? ..: '))
                    mode = `Traduza tudo que o usuário enviar para ${input_translate}, mantendo o sentido original.\n`
                }
                else if (input == "/improve") {
                    mode = 'Reescreva o conteúdo enviado de forma mais clara, correta e profissional.\n'
                }
                else if (input == "/teacher") {
                    mode = 'Explique como um professor, com didática e exemplos simples.\n'
                }
                messages[0].content = config_ia_usuario + config_ia_padrao + mode// atualiza o system
                console.log(chalk.yellow("---exec---"))
                continue
            }

            messages.push({ role: 'user', content: input})
            const chatCompletion = await getGroqChatCompletion(messages);
            const respostaAI = chatCompletion.choices[0]?.message?.content || "";
            messages.push({ role: 'assistant', content: respostaAI})
            if (messages.length > 20) {
                messages.splice(1,2)
            }

            console.log(chalk.magenta(respostaAI));
        }
    }
})
