# Como colocar o Gatinder na TV

A TV só precisa abrir **um endereço** e ficar nele:

```
https://SEU-SITE.netlify.app/tv
```

(troque `SEU-SITE` pelo endereço que a Netlify der. Dá para usar um domínio próprio depois.)

A página não tem botões. Ela passa os gatos sozinha, atualiza sozinha quando a equipe mexe no painel e continua rodando por um tempo se a internet cair.

---

## 1. A TV em pé (importante)

A TV vai ficar **na vertical**, dentro da moldura de celular. A maioria dos aparelhos (Fire Stick, Chromecast, navegador da smart TV) **não sabe girar a imagem**: eles continuam mandando a imagem "deitada". Por isso a própria página sabe se girar:

| Endereço | Quando usar |
|---|---|
| `/tv` | o aparelho já manda a imagem em pé (raro) |
| `/tv?girar=90` | TV girada com o lado **esquerdo** para cima |
| `/tv?girar=270` | TV girada com o lado **direito** para cima |

**Como descobrir:** abra `/tv?girar=90`. Se o logo do Gatinder ficar de cabeça para baixo, troque para `/tv?girar=270`.

> Dica: antes de prender a TV na moldura, confira se a entrada de energia e o HDMI ficam acessíveis no lado escolhido.

---

## 2. Primeiro: descobrir que smart TV é

A TV da loja é uma **smart TV de 32"**. O caminho depende do sistema dela. Para descobrir, veja a marca na frente/atrás da TV e o nome que aparece no menu inicial:

| O que aparece | Sistema | O que fazer |
|---|---|---|
| "Google TV" ou "Android TV" (comum em TCL, Philco, Semp, Philips, Multilaser, Sony) | Android | 👍 Melhor caso: instale o **Downloader** pela Play Store da própria TV e siga os passos do **Fully Kiosk** abaixo. Não precisa comprar nada. |
| Samsung (sistema "Tizen") | Tizen | Teste o navegador **Internet** da TV (passo 4). Se travar ou não ficar bom, use um Fire TV Stick. |
| LG (sistema "webOS") | webOS | Teste o **Navegador da Web** da TV (passo 4). Se travar ou não ficar bom, use um Fire TV Stick. |
| Roku TV (comum em AOC, Philco, Semp) | Roku | ❌ Não tem navegador. Precisa de um **Fire TV Stick** (ou outro aparelho) no HDMI. |

**Se precisar comprar um aparelho:** um **Fire TV Stick** (o modelo mais simples, "Lite", já serve) ligado no HDMI da TV.

> Uma TV de 32" geralmente tem resolução HD (1366×768). Tudo bem: a página se ajusta sozinha a qualquer resolução.

## 3. Instalar

### ⭐ Recomendado: app "Fully Kiosk Browser" (TV com Android/Google TV ou Fire TV Stick)

É a opção mais confiável: a página abre sozinha quando liga a TV, a tela não apaga e ninguém consegue sair dela por engano.

**Na TV com Android/Google TV:** instale o **Downloader** pela Play Store da TV e pule para o passo 5 abaixo (se a TV pedir, permita que o Downloader instale apps).

**Preparar o Fire Stick (uma vez):**
1. Ligue o Fire Stick e conecte no Wi-Fi da loja.
2. **Configurações → Minha Fire TV → Sobre** → clique **7 vezes** no nome do aparelho, até aparecer "Você agora é um desenvolvedor".
3. **Configurações → Minha Fire TV → Opções do desenvolvedor** → ligue **Instalar apps desconhecidos** para o app **Downloader**.
4. Na loja de apps da Amazon, instale o **Downloader** (ícone laranja).
5. No Downloader, digite `fully-kiosk.com`, entre na área de download e baixe a versão para **Fire TV / Android TV**. Instale.

**Configurar o Fully Kiosk:**
1. Abra o Fully Kiosk. Em **Start URL**, coloque o endereço da TV (com o `?girar=` certo).
2. Nas configurações (o menu abre deslizando da borda esquerda ou pelo botão de menu do controle), ligue:
   - **Device Management → Keep Screen On**: **ligado** (tela não apaga)
   - **Device Management → Launch on Boot**: **ligado** (abre sozinho ao ligar)
   - **Web Auto Reload → Reload on Network Reconnect**: **ligado**
   - **Kiosk Mode**: **ligado**, se quiser travar (anote o PIN!)
3. Algumas funções do Fully Kiosk exigem a licença paga (pagamento único, barato). Se aparecer marca d'água ou alguma função bloqueada, avalie a licença.

**Também no Fire Stick:** **Configurações → Tela e sons → Proteção de tela → Hora de início: Nunca**.

### Alternativa: Fire TV Stick só com o navegador Silk

1. Instale o **Silk Browser** (ou "Amazon Silk") pela loja da Amazon.
2. Abra o endereço da TV, depois no menu escolha **tela cheia**.
3. Desligue a proteção de tela (mesmo caminho acima).

Funciona, mas se a energia cair alguém precisa abrir o Silk de novo.

### Alternativa: Chromecast com Google TV / Google TV Streamer

Mesma ideia do Fire Stick: instale o **Downloader** pela Play Store da TV, baixe o Fully Kiosk e configure igual. Em **Configurações → Sistema → Economia de energia**, aumente ou desligue o tempo para desligar a tela.

> O Chromecast antigo (aquele "pendurado" no HDMI, sem controle remoto) **não serve**: ele só espelha uma aba aberta num computador, que teria de ficar ligado.

### Navegador da própria smart TV (Samsung, LG…)

1. Abra o navegador da TV (Samsung: "Internet"; LG: "Navegador da Web").
2. Digite o endereço e salve nos favoritos.
3. Desligue **Economia de energia**, **Desligamento automático** e **Proteção de tela** nas configurações da TV.

A página foi preparada para funcionar também em navegadores de TV mais antigos. Ainda assim, é a opção mais limitada: alguns navegadores não guardam nada para rodar sem internet, não reabrem sozinhos quando a TV liga e às vezes mostram avisos por cima da página. Teste por um dia; se der problema, use um Fire TV Stick.

---

## 4. Ajustes da TV

- **Desligar sozinha / ligar sozinha:** use o timer da própria TV (Configurações → Geral → Hora → Timer de ligar/desligar), para ela ligar quando a loja abre e desligar quando fecha. Com o Fully Kiosk em "Launch on Boot", a vitrine volta sozinha.
- **HDMI-CEC** (Anynet+ na Samsung, SimpLink na LG, Bravia Sync na Sony): ligado, para o Fire Stick ligar junto com a TV.
- **Imagem:** modo "Padrão" ou "Natural". Evite "Vívido" (as fotos dos gatos ficam com cor estranha).

---

## 5. Conferência rápida (depois de instalar)

1. A TV mostra um gato com o logo do Gatinder em cima, **em pé**, com a tela inteira aparecendo (a moldura de PVC cobre só a borda da TV, não a imagem).
2. No celular, pelo painel, mude o status de um gato para "Adotado". Em poucos segundos ele some da TV.
3. Aponte a câmera do celular para o QR code: deve abrir o WhatsApp da loja com a mensagem pronta.
4. Desligue o Wi-Fi por 1 minuto: a TV continua passando os gatos (aparece um aviso pequenininho "sem internet" no topo). Religue.

---

## O que a TV faz sozinha

- Cada gato fica o tempo configurado no painel (padrão 10 s) e sai "deslizando" para a direita com o carimbo **AMEI!**, como no app.
- A cada volta completa na lista aparece a tela **It's a Match!** com o último gato.
- A cada X minutos (padrão 5) aparece a tela **Como funciona a adoção**.
- Sem nenhum gato disponível, ela fica na tela de adoção com o aviso "Novos gatinhos chegando em breve!".
- Busca novidades na hora (tempo real) e, por garantia, a cada 1 minuto.
- Guarda a lista e as fotos no aparelho para rodar sem internet.
- Esconde o cursor, pede para a tela não apagar e recarrega 1 vez por dia, de madrugada (para pegar atualizações do site).
