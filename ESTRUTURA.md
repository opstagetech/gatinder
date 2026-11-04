# Gatinder — Etapa 1: estrutura + banco

## Estrutura de pastas (Vite + React + TS + Tailwind)

```
gatinder/
├── index.html                  # translate="no", fontes
├── INSTRUCOES-TV.md            # Etapa 4: como abrir a /tv na TV (Fire Stick, Chromecast, smart TV)
├── .node-version              # Node 22 para o build no Cloudflare Pages
├── tailwind.config.ts          # cores/fontes lendo as variáveis CSS do tema
├── .env.example                # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── public/
│   ├── _headers                # Cloudflare Pages: sw.js sem cache, assets com cache longo
│   ├── brand/                  # logos: Gatinder (cor/branco/ícone) e FecoVet (cor/branco)
│   └── sw.js                   # service worker: cache das fotos e da lista (TV offline)
├── supabase/
│   └── migrations/0001_gatinder.sql
└── src/
    ├── main.tsx / App.tsx      # rotas: /admin/*, /tv
    ├── theme/
    │   ├── theme.css           # ⭐ ÚNICO lugar com cores e fontes (troca de identidade visual)
    │   └── brand.ts            # ⭐ caminhos dos logos
    ├── lib/
    │   ├── supabase.ts         # cliente
    │   ├── api.ts              # leitura/gravação de gatos, fotos e configurações
    │   ├── format.ts           # "4 meses", "2 anos", rótulos das tags
    │   └── cropImage.ts        # corte 4:5 + compressão (1080x1350 webp) no navegador
    ├── types.ts                # Cat, Settings, enums
    ├── components/
    │   ├── CatCard.tsx         # ⭐ o card "perfil" — o MESMO usado na TV e na pré-visualização
    │   ├── TvStage.tsx         # "palco" 1080×1920 que encolhe pra caber (TV e pré-visualização)
    │   ├── TvFooter.tsx        # rodapé "Quer me adotar?" + QR do WhatsApp
    │   └── icons.tsx
    ├── admin/
    │   ├── AdminLayout.tsx     # exige login E estar na tabela staff
    │   ├── ui.tsx              # botões grandes, campos, sim/não
    │   ├── Login.tsx
    │   ├── CatList.tsx         # miniatura, nome, status (filtro por status)
    │   ├── CatForm.tsx         # cadastro/edição + botão "Pré-visualizar"
    │   ├── Preview.tsx         # tela da TV em pé, em escala, idêntica à TV
    │   └── Settings.tsx        # WhatsApp, tempo por gato, textos da tela institucional
    └── tv/
        ├── TvScreen.tsx        # loop, transição de "deslizar" com carimbo AMEI!, rodapé com QR, ?girar=90/270
        ├── MatchScreen.tsx     # "It's a Match!" de tempos em tempos
        ├── InstitutionalScreen.tsx
        ├── useCatsFeed.ts      # Realtime + polling 1 min + cache local
        └── useKiosk.ts         # esconde cursor, Wake Lock (tela não dorme), recarrega 1x/dia
```

## Banco (resumo do `0001_gatinder.sql`)

| Peça | O que é |
|---|---|
| `cats` | nome, idade (em meses), sexo, castrado, vacinado, temperamento (lista de tags), bio (≤120, travado no banco), status, foto, ordem na TV |
| `settings` | linha única: WhatsApp, mensagem pronta, segundos por gato, intervalo da tela institucional, passos da adoção |
| `staff` | lista de quem é da equipe. Ter login não basta, a pessoa precisa estar aqui |
| bucket `cat-photos` | público só pra leitura (a TV baixa sem login), JPEG/WebP até 3MB; só a equipe envia, troca e apaga |

**Regras de segurança (testadas num Postgres local):**
- TV sem login: vê **só** gatos `disponivel`
- Usuário logado que não está em `staff`: não vê nem cria nada
- Equipe: vê e edita tudo
- Ao marcar "adotado", a data de adoção é gravada sozinha

**Aviso ao vivo na TV:** toda mudança em gatos também mexe na linha de configurações (que a TV sempre vê), e a TV recarrega na hora. O polling de 1 minuto fica como reserva.

## Decisões (dá pra mudar)
- **TV em pé (retrato, 1080×1920)**, dentro de uma moldura de PVC que imita um celular. A tela da TV imita o app: barra com logo no topo, foto grande, botões ✕ ★ ❤ e rodapé com chamada + QR. *(Mudou: antes era TV deitada 16:9 com laterais desfocadas.)*
- **Foto em 4:5 retrato** (1080×1350), como perfil de app de namoro. Na TV em pé ela ocupa a largura toda.
- **Idade em meses** no banco: mostra "4 meses" pra filhote e "2 anos" pra adulto. No formulário a pessoa escolhe "meses" ou "anos".
- **Ordem na TV:** pela ordem cadastrada, com campo `sort_order` pra fixar destaques depois.
- Cadastro de funcionário é **fechado**: o dono cria os logins no painel do Supabase (passo a passo no fim do SQL).
- **Identidade:** cores do logo Gatinder (degradê #FF7343 → #FE0679); FecoVet aparece como clínica parceira (topo da TV e tela de login). Verde FecoVet usado como cor de "sim/disponível".
- **Deploy:** **Cloudflare Pages** e Supabase em **contas próprias** do Gatinder (separadas da Opstage), auto-deploy a partir do GitHub. *(Mudou: começou na Netlify, mas lá o plano grátis passou a exigir o selo "Powered by Netlify" em projetos novos, que apareceria na TV. O Cloudflare Pages é grátis, aceita uso comercial e não coloca selo. /admin e /tv abrem direto porque o Pages serve o index.html para qualquer rota quando não existe 404.html.)*
- **Fontes:** Poppins (combina com o logo da FecoVet).
- **Rotação:** como Fire Stick/Chromecast/smart TV não giram a imagem, a própria página gira com `/tv?girar=90` ou `?girar=270`.
- **Moldura de PVC:** passa por cima dos cantos da TV. A imagem continua retangular; logos, rodapé e QR ficam a `--tv-safe-x` (100px) das laterais.
- **Ritmo da TV:** gato (tempo das Configurações) → próximo gato deslizando com "AMEI!"; "It's a Match!" a cada volta completa (mín. a cada 5 gatos); "Como funciona a adoção" a cada X minutos.
