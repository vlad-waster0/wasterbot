# Baileys Modular WhatsApp Bot

Bot Node.js com comandos separados, QR Code ou código de pareamento, banco JSON e compatibilidade com Termux.

## Instalação no Termux

O GitHub baixou o projeto inteiro. O bot fica dentro da pasta `bot`; não execute `npm start` na pasta raiz do repositório, pois a raiz contém apenas a página de apresentação.

```bash
# descubra onde o download foi salvo
cd ~/storage/downloads
ls

# entre na pasta extraída do repositório e depois na pasta do bot
cd baileys-modular-whatsapp-bot/bot

# instalação automática (recomendado)
bash termux-setup.sh

# iniciar
npm start
```

Se você já estiver dentro da pasta `bot`, confirme com:

```bash
pwd
ls package.json
npm install
npm start
```

Se o nome da pasta extraída for diferente, use `ls` e substitua `baileys-modular-whatsapp-bot` pelo nome real. Não digite os símbolos `$` dos exemplos.

Ao iniciar, escaneie o QR exibido no terminal em **WhatsApp > Dispositivos conectados**. Para pareamento, abra `.env`, preencha `PAIRING_NUMBER` com DDI + DDD + número, sem `+`, espaços ou símbolos, e rode `npm start` novamente.

### Erros comuns

- `Missing script: start`: você está na pasta raiz; execute `cd bot`.
- `Cannot find package`: execute `npm install` dentro de `bot`.
- `No such file or directory`: use `pwd`, depois `ls`; o nome da pasta pode ter sido alterado pelo gerenciador de arquivos.
- `EACCES` ou `permission denied`: execute `termux-setup-storage` uma vez e use uma cópia em `~/`, por exemplo `cp -r ~/storage/downloads/baileys-modular-whatsapp-bot ~/`.
- O QR não aparece: apague a pasta `auth_info` somente se quiser iniciar uma nova sessão e rode `npm start` de novo.

## Configuração

- `PREFIX`: prefixo inicial, padrão `!`.
- `OWNER_NUMBERS`: números separados por vírgula que podem administrar grupos.
- `PAIRING_NUMBER`: ativa código de pareamento quando preenchido.
- `DB_FILE`: caminho do banco JSON.

O prefixo também pode ser alterado em tempo de execução com `!setprefix #`.

## Estrutura

- `src/index.js`: conexão Baileys e roteador.
- `src/config.js`: variáveis de ambiente.
- `src/database.js`: persistência local com lowdb.
- `src/commands/`: um módulo por família de comandos.
- `auth_info/`: sessão gerada automaticamente; não compartilhe nem versione esta pasta.

## Comandos principais

`!menu`, `!ping`, `!sticker`, `!gif`, `!dado`, `!moeda`, `!quiz`, `!download`, `!tagall`, `!kick`, `!promote`, `!demote`, `!setprefix`.

O comando `download` aceita URL direta de arquivo. Para YouTube, Instagram ou TikTok, conecte uma biblioteca/API específica conforme os termos e limites do serviço antes de adicionar um módulo dedicado.
