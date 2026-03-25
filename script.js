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
        choices:['Texto', 'Documentos', 'Imagem'] 
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
    } //ADICIONAR FUNÇÃO DE SALVAR CONTEUDO DO TERMINAL EM UM BLOCO DE NOTAS COM TITULO PERSONALIZAVEL

    // Documentos =====================
    if(resposta.opcao === 'Documentos') {
    //     como fazer uma IA que resuma documentos (pdf, wordd, powerpoint, bloco de notas e etc) com javascript apenas no terminal
    // Primeiro crie um projeto Node.js com npm init e instale as dependências necessárias. Para extrair texto use pdf-parse para PDF, officeparser ou mammoth para Word, officegen para PowerPoint e fs para arquivos de texto. Depois converta cada documento em uma string e concatene todo o conteúdo. Para resumir, faça uma chamada HTTP POST para a API do OpenAI ou use um modelo local como llama.cpp exposto via REST. No terminal, receba o caminho do arquivo como argumento, processe o conteúdo, envie a string para a API com a instrução “resuma em poucos parágrafos” e exiba a resposta no console. Certifique-se de que a chave da API esteja guardada em uma variável de ambiente. O fluxo completo pode ser organizado em um único script index.js que lê o arquivo, extrai o texto, chama a API e imprime o resumo.

    //  ..: 

    // com isso, tem como fazer a tradução dos arquivos?
    // Sim, a mesma estrutura pode ser usada para traduzir documentos. Depois de extrair o texto com pdf-parse, officeparser ou outras bibliotecas, envie a string extraída para a API de tradução. Se usar o OpenAI, você pode enviar um prompt do tipo “Translate this text to Portuguese: …” e o modelo retornará a tradução. Você pode fazer isso em um único comando no terminal. Basta colocar o caminho do arquivo como argumento, extrair o conteúdo, construir o prompt com a instrução de tradução, chamar a API e imprimir a resposta. Se preferir não usar a API, existem modelos open‑source como a T5 ou mBART que podem ser carregados via Hugging Face e usados localmente, mas exigem mais recursos. O fluxo permanece o mesmo: extração, chamada de tradução, exibição.
    }


})
