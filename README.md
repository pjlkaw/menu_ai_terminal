# Lumin

Lumin é um CLI feito em Node.js que integra inteligência artificial direto no terminal.

A ideia surgiu de um incômodo simples: depender de navegador e login pra usar IA em tarefas básicas. Então resolvi trazer isso pro ambiente que eu já uso: o terminal.

##

- Interface interativa no terminal
- Leitura de arquivos:
  - .txt
  - .docx
  - .pdf
  - .xlsx
- Resumo automático de conteúdo
- Respostas baseadas no conteúdo do arquivo
- Modos de resposta:
  - curto
  - detalhado
  - técnico (linux, código, etc.)
- Sistema de salvar e carregar conversas

## Como usar

Clone o repositório:
```bash
git clone https://github.com/pjlkaw/menu_ai_terminal.git
cd menu_ai_terminal
````

Instale as dependências:
````bash
npm install
````

Crie um arquivo .env na raiz do projeto:
```.env
GROQ_API_KEY=YOUR_API_KEY_HERE
```

Inicie o projeto:
```
npm start
```

## Estrutura
src/script.js → menu principal e IA de texto
src/documentosAI.js → leitura e interação com arquivos
docs/ → arquivos para análise
saves/ → conversas salvas
Comandos (modo texto)

/helpme /end /linux /short /long
/formal /en /it /code /fix /explain
/resume /translate /improve /teacher

/_save /_load

### Observações
O projeto ainda está em desenvolvimento
Algumas partes ainda estão sendo ajustadas
Tem bastante coisa experimental
O foco principal é aprender e evoluir com o projeto
