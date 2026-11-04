# Gatinder

Vitrine de adoção do gatil na TV da loja, no estilo de app de namoro.

- **/admin**: painel da equipe (celular). Cadastra gatos, fotos e configurações.
- **/tv**: tela da TV em pé, sem botões, passando os gatos disponíveis em loop. Como instalar na TV: [INSTRUCOES-TV.md](INSTRUCOES-TV.md).

Estrutura e decisões: [ESTRUTURA.md](ESTRUTURA.md). Banco: [supabase/migrations/0001_gatinder.sql](supabase/migrations/0001_gatinder.sql).

## Colocar no ar (uma vez)

O Gatinder usa **contas próprias** no Supabase e na Netlify, separadas da Opstage. Crie as duas com o e-mail do gatil, usando **e-mail e senha** (não "Entrar com GitHub"), para não misturar com as contas que já existem.

1. **Supabase** (conta nova, em supabase.com): criar o projeto do gatil (região *South America (São Paulo)*), abrir o *SQL Editor*, colar e rodar o `0001_gatinder.sql`. Depois seguir os 3 passos do fim do arquivo (desligar cadastro aberto, criar logins, colocar na tabela `staff`).
2. **Supabase → Project Settings → API**: copiar a *Project URL* e a chave *anon public*.
3. **Netlify** (conta nova, em netlify.com): *Add new site → Import an existing project → GitHub*. A Netlify vai pedir para autorizar o acesso ao GitHub: autorize e dê acesso ao repositório `gatinder`. O `netlify.toml` já cuida do build.
4. **Netlify → Site configuration → Environment variables**: criar
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = chave anon public
   
   e mandar publicar de novo (*Deploys → Trigger deploy*).
5. **Liberar o Dr. Matheus no painel** (no Supabase do gatil):
   1. *Authentication → Users → Add user → Create new user*: e-mail do Dr. Matheus + uma senha. Marque *Auto Confirm User*.
   2. *SQL Editor*, rodar (trocando o e-mail):
      ```sql
      insert into staff (user_id, name)
      select id, 'Dr. Matheus' from auth.users where email = 'email-do-matheus@exemplo.com';
      ```
   3. Passar o e-mail e a senha para ele. Para outra pessoa no futuro, é só repetir.
6. Abrir `https://SEU-SITE.netlify.app/admin`, entrar com um login da equipe e cadastrar os gatos. A TV usa `https://SEU-SITE.netlify.app/tv` (veja [INSTRUCOES-TV.md](INSTRUCOES-TV.md)).

> **Plano grátis do Supabase:** projetos sem nenhum uso por 7 dias são pausados. Com a TV ligada consultando o banco todo dia isso não acontece, mas se a loja ficar fechada mais de uma semana (férias), entre no painel do Supabase e clique em *Restore* se o projeto tiver pausado.

## Trocar a identidade visual

Cores, fontes e cantos arredondados ficam só em `src/theme/theme.css`. As fontes também são carregadas no `<head>` do `index.html`.

## Rodar no computador (desenvolvedor)

```bash
cp .env.example .env   # preencher com os dados do Supabase
npm install
npm run dev
```
