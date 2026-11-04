# Gatinder: registro do processo

Documento de referência do projeto: o que foi feito, onde está cada coisa, como operar e como manter.
Última atualização: 04/11/2026.

> **Sem senhas aqui.** Este arquivo fica no GitHub. Senhas e chaves secretas ficam só num gerenciador de senhas ou num lugar seguro do responsável.

---

## 1. O que é

Vitrine de adoção do **gatil permanente dentro da FecoVet** (clínica veterinária/petshop). Uma TV **em pé**, dentro de uma moldura de PVC que imita um celular, passa em loop os gatos disponíveis, no estilo de perfil de app de namoro ("dar match" com o gato antes de adotar). A equipe só cadastra foto e dados pelo celular; a TV se atualiza sozinha.

| Parte | Endereço | Quem usa |
|---|---|---|
| Painel | https://gatinder.pages.dev/admin | Equipe (hoje: Dr. Matheus), pelo celular |
| TV | https://gatinder.pages.dev/tv | A TV da loja (sem botões) |

---

## 2. Onde está cada coisa

Tudo em **contas próprias do Gatinder**, separadas da Opstage.

| Serviço | Para quê | Identificação |
|---|---|---|
| **GitHub** | Código | repositório `opstagetech/gatinder`, ramo `main` |
| **Cloudflare Pages** | Hospedagem do site | projeto `gatinder` → `gatinder.pages.dev` |
| **Supabase** | Banco, fotos e logins | organização *Fecovet*, projeto *Gatinder*, ID `iywwyuwdjwmjakbjvoro`, região us-east-2 |

**Variáveis de ambiente no Cloudflare Pages** (Settings → Variables and Secrets, tipo *Text*):
- `VITE_SUPABASE_URL` = `https://iywwyuwdjwmjakbjvoro.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = *Publishable key* do Supabase (`sb_publishable_…`). Ela é pública por natureza.

**Nunca** colocar no site a *Secret key* (`sb_secret_…`) do Supabase.

---

## 3. Como foi construído (etapas)

1. **Estrutura + banco** (`supabase/migrations/0001_gatinder.sql`, `ESTRUTURA.md`): tabelas `cats`, `settings`, `staff`, bucket de fotos `cat-photos`, regras de segurança (TV sem login só vê gatos *disponíveis*; só quem está em `staff` mexe em algo).
2. **Painel /admin**: login, lista com filtro, cadastro com foto cortada em 4:5 no navegador, pré-visualização idêntica à TV, configurações.
3. **Tela /tv**: loop com transição de "deslizar" (carimbo AMEI!), "It's a Match!", tela "Como funciona a adoção", rodapé com QR do WhatsApp, tempo real + consulta a cada 1 min, cache offline, modo quiosque.
4. **Instruções da TV** (`INSTRUCOES-TV.md`).

Pedidos de junção no GitHub: [#1](https://github.com/opstagetech/gatinder/pull/1) (sistema completo), [#2](https://github.com/opstagetech/gatinder/pull/2) (Cloudflare + tela de adoção), [#3](https://github.com/opstagetech/gatinder/pull/3) (cantos da moldura).

### Decisões que mudaram no caminho (e por quê)

| Antes | Depois | Motivo |
|---|---|---|
| TV deitada 16:9 | **TV em pé 1080×1920** | A TV vai dentro de uma moldura de celular |
| Tema provisório (Fredoka/Nunito) | **Logos oficiais + Poppins** | Chegaram os logos do Gatinder e da FecoVet; Poppins combina com a FecoVet |
| Login só por e-mail | **E-mail ou só usuário** (`matheus` → `matheus@gatinder.local`) | Equipe sem e-mail próprio |
| Netlify | **Cloudflare Pages** | No plano grátis da Netlify, projetos novos (desde 19/08/2026) mostram o selo "Powered by Netlify" sem opção de tirar, e ele apareceria na TV. Cloudflare Pages é grátis, aceita uso comercial e não tem selo |
| Cantos arredondados na imagem | **Imagem retangular, sem informação nos cantos** | A moldura de PVC passa por cima dos cantos; só logos, rodapé e QR foram afastados deles |
| Build moderno | **Compatível com navegadores antigos** | A TV pode usar o navegador da própria smart TV |

---

## 4. Operação do dia a dia (equipe)

- **Cadastrar gato:** painel → *Cadastrar gato* → foto, nome, idade, sexo, castrado, vacinado, temperamento, bio (até 120 letras), status → *Salvar*. Use *Pré-visualizar* para ver como fica na TV.
- **Tirar da TV:** mudar o status para *Em processo de adoção* ou *Adotado*. Prefira isso a apagar: apagar não tem volta.
- **WhatsApp, tempos e textos:** painel → engrenagem (*Configurações*). O QR some se o número ficar vazio.
- A TV atualiza sozinha em segundos (e, por garantia, a cada 1 minuto).

## 5. Administração (responsável)

**Adicionar alguém à equipe** (Supabase do Gatinder):
1. *Authentication → Users → Add user → Create new user*: e-mail (ou `nome@gatinder.local` para login só com usuário) + senha, marcar *Auto Confirm User*.
2. *SQL Editor*:
   ```sql
   insert into staff (user_id, name)
   select id, 'Nome da pessoa' from auth.users where email = 'nome@gatinder.local';
   ```
   Resultado esperado: *1 row*.

**Trocar senha de alguém:** *Authentication → Users* → clicar no usuário → alterar senha. (Logins `@gatinder.local` não recebem e-mail de recuperação.)

**Remover alguém:** *Authentication → Users* → apagar o usuário (sai da equipe junto).

## 6. Como mudar o site

1. A mudança é feita no código (com o Claude Code) num ramo de trabalho e enviada ao GitHub.
2. Abre-se um **pedido de junção** (pull request) para o `main`.
3. Você clica em **Merge pull request → Confirm merge**.
4. O Cloudflare publica sozinho em 1–2 minutos. Na TV, a versão nova entra na recarga diária (madrugada) ou ao reiniciar o navegador; no computador, `Ctrl + F5`.

**Ajustes rápidos sem programador "de verdade":**
- Cores e fontes: `src/theme/theme.css`
- Logos: arquivos em `public/brand/` (mesmo nome) ou caminhos em `src/theme/brand.ts`
- Distância dos cantos por causa da moldura: `--tv-safe-x` em `src/theme/theme.css` (hoje 100)

---

## 7. Manutenção e riscos

| Item | Risco | O que fazer |
|---|---|---|
| Supabase grátis pausa após 7 dias sem uso | Baixo com a TV ligada | Em férias longas, entrar no Supabase e clicar em *Restore* se pausar |
| Supabase grátis sem backup restaurável | Apagar um gato não tem volta | Usar status *Adotado* em vez de apagar |
| Limites grátis (1 GB fotos, 500 MB banco) | Muito baixo (cada foto ~200–300 KB) | Nada |
| Cloudflare Pages marcado como "legacy" | Baixo; projetos existentes seguem funcionando | Se o Cloudflare anunciar desligamento, migrar para Workers (mudança pequena) |
| Site fora do ar por algumas horas | TV continua com a lista e fotos guardadas | Só o painel fica indisponível |
| Perder acesso a uma conta | O maior risco real | Ativar verificação em duas etapas no GitHub, Cloudflare e Supabase; guardar logins e a senha do banco do Supabase |
| Remover acesso do Cloudflare ao GitHub | Site fica no ar, mas para de atualizar | Manter conectado |

**Limpeza pendente:** apagar o projeto antigo na **Netlify** (*Project configuration → General → Delete project*) e, se quiser, tirar o acesso da Netlify ao repositório em github.com/settings/installations.

---

## 8. Pendências com a petshop

- [ ] Marca/sistema da smart TV de 32" (define o caminho em `INSTRUCOES-TV.md`: Fully Kiosk na própria TV, navegador da TV ou Fire TV Stick)
- [ ] Testar qual rotação usar: `/tv?girar=90` ou `/tv?girar=270`
- [ ] Número de WhatsApp no painel (*Configurações*) e testar o QR com o celular
- [ ] Foto da TV já com a moldura de PVC, para conferir a distância dos cantos (`--tv-safe-x`)
- [ ] Cadastrar os gatos reais
