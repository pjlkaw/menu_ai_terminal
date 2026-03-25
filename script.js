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
        let config_ia_padrao = 'sem formatação, apenas com espaços e quebras de linha, sempre em português(exeto se o usuário pedir outra lingua ou comandos), sem texto longos, diga o essencial sem ser grosso e sempre guarde em sua memória as ultimas coisas q vc falar - Se o valor digitado pelo usuário começar com (/) ignore e responda com (-----) '

        //Solicitação
        async function getGroqChatCompletion() {
        return groq.chat.completions.create({
                messages: [
                    { 
                        role: 'system', 
                        content: config_ia_usuario + config_ia_padrao
                    },
                    {
                        role: "user",
                        content: input
                    }],
                model: "openai/gpt-oss-20b"
            })
        }
        console.log(chalk.green('\n Escreva para a IA responder'))
        while (input !== "/end") {
            // comandos com / e templates
            if (input == "/helpme") {
                const helpme = fs.readFileSync('./helpme.txt', 'utf-8')
                console.log(helpme)
            }
            else if (input == "/linux"){
                config_ia_padrao = 'ajude com linux' + config_ia_padrao
            }
            getGroqChatCompletion()
            input = readlineSync.question(chalk.green('\n ..: \n\n'))
            
            const chatCompletion = await getGroqChatCompletion();
            const respostaAI = chatCompletion.choices[0]?.message?.content || "";

            console.log(chalk.magenta(respostaAI));
        }
    }
})
