# 🚀 Guia Passo a Passo: Como Publicar o Site na Hostinger

Este guia ensina como colocar o site da **Vai de Elétrica** no ar na sua hospedagem da **Hostinger** em menos de 5 minutos.

---

## 📦 Método 1: Hospedagem Compartilhada / Cloud / WordPress da Hostinger (Mais Rápido e Fácil)

O projeto já está totalmente compilado, com todos os arquivos estáticos, imagens originais e regras de roteamento Apache `.htaccess` configuradas.

### Passo 1: Obter o Arquivo ZIP do Site
O arquivo compilado com tudo pronto chama-se:
👉 **`dist-hostinger.zip`** (disponível na raiz do projeto e acessível pelo link `/dist-hostinger.zip`).

### Passo 2: Acessar a Hostinger
1. Faça login no seu painel da Hostinger (**hPanel**): [https://hpanel.hostinger.com](https://hpanel.hostinger.com)
2. No menu superior ou lateral, clique em **Sites** (ou **Hospedagem**).
3. Localize o seu domínio e clique em **Gerenciar**.

### Passo 3: Abrir o Gerenciador de Arquivos
1. No menu lateral do hPanel, procure pela seção **Arquivos** e clique em **Gerenciador de Arquivos**.
2. Clique para acessar os arquivos do seu domínio.
3. Abra a pasta:
   📂 **`public_html`**

*(Se houver um arquivo padrão chamado `default.php` criado pela Hostinger, você pode apagá-lo).*

### Passo 4: Fazer o Upload e Extrair
1. No canto superior direito do Gerenciador de Arquivos, clique no botão **Enviar (Upload)** ➡️ **Arquivo**.
2. Selecione o arquivo **`dist-hostinger.zip`** e aguarde o envio ser concluído.
3. Clique com o **botão direito** sobre o arquivo `dist-hostinger.zip` que acabou de subir e selecione **Extrair (Extract)**.
4. Escolha extrair diretamente dentro da pasta `public_html`.
5. Verifique se os arquivos estão na raiz da `public_html`:
   - `index.html`
   - `.htaccess` *(garante que as rotas como #admin funcionem sem dar erro 404)*
   - pasta `assets/`
   - pasta `images/`
   - pasta `uploads/` *(com as fotos das scooters e seu QR Code do Pix)*

### Passo 5: Testar o Site no Ar
Abra o seu navegador e acesse o seu domínio:
- Site público: `https://seudominio.com.br`
- Painel Admin: `https://seudominio.com.br/#admin`
*(E-mail padrão: `admin@vaideeletrica.com.br` | Senha: `admin123`)*

---

## 🔒 Segurança da API e Dados Sensíveis
- **Chave de API do Gemini**: **Nenhuma** chave de API do Gemini ou senha privada está gravada no HTML ou JavaScript do site.
- **Pagamentos PIX**: O QR Code e a chave Copia e Cola informados no painel administrativo estão gravados como dados da loja, prontos para receber diretamente na sua conta bancária sem intermediários.
