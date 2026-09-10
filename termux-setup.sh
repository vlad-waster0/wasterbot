#!/data/data/com.termux/files/usr/bin/bash
set -e

cd "$(dirname "$0")"
printf '\n[1/3] Instalando dependências do Termux...\n'
pkg update -y
pkg install nodejs -y
printf '\n[2/3] Instalando dependências do bot...\n'
npm install
printf '\n[3/3] Criando configuração...\n'
[ -f .env ] || cp .env.example .env
mkdir -p data
printf '\nPronto. Edite .env e execute:\n  npm start\n\n'
