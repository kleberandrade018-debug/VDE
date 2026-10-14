# 🚀 Manual de Deploy na Hostinger via GitHub: Vai de Elétrica

Este guia detalha a análise técnica completa do projeto e o passo a passo exato para você conectar seu repositório do **GitHub** com a **Hostinger** e ter deploy 100% automatizado (basta dar `git push` para seu site atualizar sozinho na nuvem).

---

## 📊 1. Relatório de Análise Automática do Projeto

| Categoria | Detalhes Identificados | Observações de Produção |
| :--- | :--- | :--- |
| **Framework Frontend** | **React 19** (`^19.0.1`) + **Vite 8** (`^8.3.0`) + **TypeScript** | Arquitetura SPA ultra-rápida, compilada em assets estáticos otimizados via Vite. |
| **Estilização & UI** | **Tailwind CSS v4** + **Motion** + **Lucide React** + **Canvas Confetti** | Zero dependências pesadas de UI externa; estilização nativa Tailwind v4 compilada. |
| **Servidor / Backend** | **Node.js** + **Express 4** (`^4.21.2`) em `server.ts` | Suporta execução full-stack com Node.js ou exportação estática SPA com Apache `.htaccess`. |
| **Gerenciador de Pacotes** | **npm** (padrão universal) e suporte a **Bun** | `package.json` configurado com scripts limpos de build e deploy. |
| **Banco de Dados** | **Banco de Documentos JSON Atômico** (`/data`) | `products.json`, `admins.json`, `settings.json`, `orders.json` com gravação atômica (`atomicWriteJson`). Suporte pré-configurado para **Supabase (PostgreSQL)** via `supabase-schema.sql`. |
| **APIs e Serviços Externos** | 1. **ViaCEP API** (consulta de CEP no checkout)<br>2. **WhatsApp API Direct** (`wa.me` para suporte e pedidos)<br>3. **Banco Central do Brasil / Pix EMVCo BR Code** (QRCode offline nativo)<br>4. **Google Gemini API** (IA do AI Studio) | Nenhuma chamada a API externa expõe chaves no frontend. |
| **Dados Sensíveis & Chaves** | • `ADMIN_EMAIL` e `ADMIN_PASSWORD` (criptografados com **bcryptjs**)<br>• `JWT_SECRET` (assinatura de tokens administrativos)<br>• `GEMINI_API_KEY` (mantido exclusivamente em variáveis de ambiente)<br>• `.env*` protegido no `.gitignore` | **Nenhum token ou senha privada está embutido no HTML/JS público.** |

---

## 🛠️ 2. Como Fazer o Deploy Automático via GitHub Actions (Método Recomendado)

O fluxo de CI/CD já está criado no projeto no arquivo:
👉 `.github/workflows/deploy.yml`

Toda vez que você fizer `git push` para a branch `main` no GitHub, o GitHub Actions irá:
1. Instalar as dependências automaticamente (`npm ci`);
2. Compilar os arquivos do site com Vite (`npm run build`);
3. Sincronizar os arquivos da pasta `dist/` diretamente na pasta `public_html/` da sua Hostinger via FTP/SFTP com segurança.

### Passo 1: Obter as Credenciais de FTP na Hostinger
1. Acesse o **hPanel da Hostinger**: [https://hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Vá em **Sites** (ou **Hospedagem**) ➡️ clique em **Gerenciar** no seu domínio.
3. No menu lateral esquerdo, vá em **Arquivos** ➡️ **Contas FTP**.
4. Anote os 3 dados exibidos na tela:
   - **Host / Servidor FTP** (ex: `ftp.seudominio.com.br` ou `accessXXXXX.hostinger.com`)
   - **Nome de Usuário FTP** (ex: `u123456789`)
   - **Senha do FTP** (caso não saiba, clique em "Alterar Senha" e crie uma nova).

### Passo 2: Cadastrar os Segredos (Secrets) no GitHub
1. Abra o seu repositório no **GitHub** (`https://github.com/seu-usuario/seu-repositorio`).
2. Clique na aba superior **Settings** (Configurações).
3. No menu lateral esquerdo, clique em **Secrets and variables** ➡️ **Actions**.
4. Clique no botão verde **New repository secret** e adicione os 3 segredos:

| Nome do Segredo (Secret Name) | Valor (Secret Value) |
| :--- | :--- |
| `HOSTINGER_FTP_SERVER` | O host/IP do servidor FTP fornecido pela Hostinger |
| `HOSTINGER_FTP_USERNAME` | O usuário do FTP da Hostinger |
| `HOSTINGER_FTP_PASSWORD` | A senha do usuário FTP |

### Passo 3: Enviar o Código para o GitHub
No seu terminal ou pasta do projeto:
```bash
git init
git add .
git commit -m "feat: site Vai de Eletrica pronto para producao"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```
Assim que o comando terminar, vá na aba **Actions** no GitHub: você verá o deploy rodando e em menos de 1 minuto seu site estará no ar na Hostinger!

---

## 🌐 3. Método Alternativo: Integração Git Direta pelo Painel da Hostinger (hPanel Git)

Se preferir conectar sem GitHub Actions:
1. No **hPanel da Hostinger**, pesquise por **Git** na barra de ferramentas ou vá em **Avançado** ➡️ **Git**.
2. No campo **Repositório**: cole a URL do seu GitHub (ex: `https://github.com/seu-usuario/seu-repositorio.git`).
3. No campo **Branch**: selecione `main`.
4. No campo **Diretório**: informe `public_html` (ou selecione a pasta padrão).
5. Clique em **Criar / Conectar**.
6. A Hostinger fornecerá uma **URL de Webhook**. Copie essa URL, vá nas configurações do seu GitHub (`Settings` ➡️ `Webhooks` ➡️ `Add Webhook`) e cole-a lá. Toda alteração no GitHub acionará a Hostinger instantaneamente.

---

## 🔒 4. Roteamento de Rotas e Segurança (.htaccess)

O projeto inclui o arquivo `public/.htaccess`, que é automaticamente copiado para a pasta `dist/` durante o build:
- Permite o acesso a qualquer rota do site (incluindo o Painel Administrativo `#admin`) sem erros 404 de Apache;
- Habilita compressão e expiração de cache para carregamento ultrarrápido das imagens das scooters elétricas;
- Aplica cabeçalhos de segurança contra Clickjacking e XSS (`X-Frame-Options`, `X-Content-Type-Options`).
