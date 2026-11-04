# Gatinder

Vitrine de adoção do gatil na TV da loja, no estilo de app de namoro.

- **/admin**: painel da equipe (celular). Cadastra gatos, fotos e configurações.
- **/tv**: tela da TV em pé, sem botões, passando os gatos disponíveis em loop. *(Etapa 3)*

Estrutura e decisões: [ESTRUTURA.md](ESTRUTURA.md). Banco: [supabase/migrations/0001_gatinder.sql](supabase/migrations/0001_gatinder.sql).

## Colocar no ar (uma vez)

1. **Supabase**: criar o projeto do gatil, abrir o *SQL Editor*, colar e rodar o `0001_gatinder.sql`. Depois seguir os 3 passos do fim do arquivo (desligar cadastro aberto, criar logins, colocar na tabela `staff`).
2. **Supabase → Project Settings → API**: copiar a *Project URL* e a chave *anon public*.
3. **Netlify**: *Add new site → Import from GitHub* → escolher este repositório. O `netlify.toml` já cuida do build.
4. **Netlify → Site configuration → Environment variables**: criar
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = chave anon public
   
   e mandar publicar de novo (*Deploys → Trigger deploy*).

## Trocar a identidade visual

Cores, fontes e cantos arredondados ficam só em `src/theme/theme.css`. As fontes também são carregadas no `<head>` do `index.html`.

## Rodar no computador (desenvolvedor)

```bash
cp .env.example .env   # preencher com os dados do Supabase
npm install
npm run dev
```
