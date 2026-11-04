# Gatinder

Vitrine de adoção do gatil na TV da loja, no estilo de app de namoro.

- **/admin**: painel da equipe (celular). Cadastra gatos, fotos e configurações.
- **/tv**: tela da TV em pé, sem botões, passando os gatos disponíveis em loop. Como instalar na TV: [INSTRUCOES-TV.md](INSTRUCOES-TV.md).

Estrutura e decisões: [ESTRUTURA.md](ESTRUTURA.md). Banco: [supabase/migrations/0001_gatinder.sql](supabase/migrations/0001_gatinder.sql).

## Colocar no ar (uma vez)

O Gatinder usa **contas próprias** no Supabase e no Cloudflare, separadas da Opstage. Crie as duas com o e-mail do gatil, usando **e-mail e senha** (não "Entrar com GitHub").

### Supabase (banco, fotos e logins)

1. Em supabase.com, criar o projeto do gatil (de preferência na região *South America (São Paulo)*).
2. *SQL Editor → New query*: colar e rodar o `supabase/migrations/0001_gatinder.sql`.
3. *Authentication → Sign In / Providers*: desligar **Allow new users to sign up**.
4. **Liberar o Dr. Matheus no painel:**
   1. *Authentication → Users → Add user → Create new user*: e-mail + senha, marcando *Auto Confirm User*.
      **Sem e-mail?** Use um "usuário" no formato `matheus@gatinder.local`. No painel, ele entra digitando só `matheus` e a senha. (Esse e-mail não existe; a troca de senha é feita por você no Supabase.)
   2. *SQL Editor*, rodar (trocando o e-mail):
      ```sql
      insert into staff (user_id, name)
      select id, 'Dr. Matheus' from auth.users where email = 'matheus@gatinder.local';
      ```
   3. Para outra pessoa no futuro, é só repetir.
5. *Project Settings → API Keys*: copiar a *Publishable key* (`sb_publishable_…`). A *Project URL* é `https://ID-DO-PROJETO.supabase.co` (aparece no botão *Connect*). **Nunca** use a *Secret key*.

### Cloudflare Pages (o site)

1. Em dash.cloudflare.com, criar a conta (e-mail e senha) e confirmar o e-mail.
2. Menu *Compute (Workers) → Workers & Pages → Create* → aba **Pages** → **Import an existing Git repository** (ou *Connect to Git*).
3. Conectar o GitHub e dar acesso ao repositório **gatinder**.
4. Configurar o build:
   - *Project name*: `gatinder` (vira `gatinder.pages.dev`; se estiver ocupado, escolha outro)
   - *Production branch*: `main`
   - *Framework preset*: **React (Vite)** (ou *None*)
   - *Build command*: `npm run build`
   - *Build output directory*: `dist`
5. Em *Environment variables (advanced)*, adicionar (tipo **Text**, não Secret):
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = Publishable key
6. *Save and Deploy*. Se esquecer as variáveis: *Settings → Variables and Secrets*, adicionar, e depois *Deployments → … → Retry deployment* (as variáveis só entram numa publicação nova).
7. Abrir `https://gatinder.pages.dev/admin` (painel) e `https://gatinder.pages.dev/tv` (TV, veja [INSTRUCOES-TV.md](INSTRUCOES-TV.md)).

Toda vez que algo entra no `main` do GitHub, o Cloudflare publica sozinho.

> **Plano grátis do Supabase:** projetos sem nenhum uso por 7 dias são pausados. Com a TV ligada consultando o banco todo dia isso não acontece, mas se a loja ficar fechada mais de uma semana (férias), entre no painel do Supabase e clique em *Restore* se o projeto tiver pausado.

## Trocar a identidade visual

Cores, fontes e cantos arredondados ficam só em `src/theme/theme.css`. As fontes também são carregadas no `<head>` do `index.html`.

## Rodar no computador (desenvolvedor)

```bash
cp .env.example .env   # preencher com os dados do Supabase
npm install
npm run dev
```
