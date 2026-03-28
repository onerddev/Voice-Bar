# 🎙️ VoiceBar — Assistente de Voz Desktop

Uma barra de voz flutuante que fica sempre visível na sua tela.

---

## 🚀 Como instalar e rodar

### Pré-requisitos
- **Node.js** (versão 18 ou superior) → https://nodejs.org

### Passo a passo

1. **Extraia** o arquivo ZIP em uma pasta no seu computador

2. **Abra o terminal** (Prompt de Comando ou PowerShell no Windows) dentro da pasta extraída

3. **Instale as dependências:**
   ```
   npm install
   ```

4. **Rode o app:**
   ```
   npm start
   ```

---

## ⚙️ Configuração

1. Clique no ícone de **engrenagem** na barra
2. Cole sua **chave API Groq** (obtenha grátis em https://console.groq.com)
3. Escolha o **modelo** desejado
4. Clique em **Salvar**

---

## 🎮 Como usar

| Ação | Comando |
|------|---------|
| Ativar/ocultar | **Alt+Space** |
| Falar | Clique no botão branco do microfone |
| Fechar | Clique no X (minimiza para a bandeja) |

### Exemplos de comandos de voz:
- *"Abre o YouTube"* → abre no navegador
- *"Abre o Spotify"* → abre no navegador  
- *"Pesquisa sobre inteligência artificial"* → busca no Google
- *"Qual é a capital da França?"* → responde por voz via IA
- *"Me explica o que é machine learning"* → responde por voz via IA

---

## 📦 Criar executável (.exe / .dmg)

Para gerar um instalador:

```
npm run build:win    # Windows (.exe)
npm run build:mac    # Mac (.dmg)
npm run build:linux  # Linux (AppImage)
```

O arquivo ficará na pasta `dist/`.

---

## 🔑 Chave API Groq

A Groq oferece uma camada gratuita generosa. Crie sua conta em:
👉 https://console.groq.com

---

## Atalhos reconhecidos

| Fala | Ação |
|------|------|
| "Abre o [site]" | Abre no navegador |
| "Pesquisa [termo]" | Busca no Google |
| "Busca por [termo]" | Busca no Google |
| Qualquer pergunta | Responde via IA Groq |
