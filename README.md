# Dr. Leonardo Guarçoni — Site institucional

One page institucional do Dr. Leonardo Pereira Guarçoni Duarte, cirurgião-dentista
especialista em odontologia estética restauradora, em Vila Velha, ES.

## Como rodar

```bash
npm install        # primeira vez
npm run dev        # desenvolvimento (http://localhost:5173)
npm run build      # build de produção → dist/
npm run preview    # serve o build (http://localhost:4173)
npm run images     # regenera public/images a partir de assets-src/
```

## Onde editar conteúdo

Todos os dados editáveis (contatos, endereço, tratamentos, formação, CRO,
mensagem do WhatsApp, metadata) ficam em **`src/site.data.js`**. Eles são
injetados no `index.html` durante o build pelo plugin em `vite.config.js`.
Textos das seções (hero, posicionamento, biografia, filosofia) ficam
diretamente no `index.html`.

## Estrutura

```
index.html                  página completa (HTML semântico + tokens {{...}})
src/site.data.js            ÚNICA fonte de dados editáveis
src/main.js                 interações (menu, tabs de tratamentos, reveals, parallax)
src/styles/
  fonts.css                 @font-face (Literata + Hanken Grotesk, auto-hospedadas)
  tokens.css                design tokens (cores OKLCH, tipografia, espaçamento)
  base.css                  reset, botões, foco, sistema de reveal
  site.css                  header, menu, seções, footer, responsivo
src/fonts/                  woff2 (subsets latinos, licença SIL OFL, via Fontsource)
assets-src/                 originais do cliente (fonte para o script de imagens)
public/images/              imagens otimizadas (WebP + OG em JPEG)
scripts/optimize-images.mjs conversão de imagens (sharp)
scripts/qa.mjs              QA automatizado (Playwright): screenshots, console,
                            overflow, interações — requer `npm run preview` ativo
scripts/contrast.mjs        auditoria WCAG dos tokens de cor
```

## Decisões técnicas

- **Sem framework de UI e sem GSAP**: HTML + CSS + ~5 KB de JS resolvem tudo
  (menu acessível, índice de tratamentos com semântica de tabs, reveals com
  IntersectionObserver, parallax leve só em desktop/ponteiro fino).
- **`prefers-reduced-motion`** respeitado em todas as animações.
- **Fontes auto-hospedadas** com `unicode-range` (só o subset necessário é
  baixado) e fallbacks com métricas ajustadas para reduzir CLS.
- **Tabs de tratamentos**: sem JavaScript, os nove resumos ficam todos
  visíveis (conteúdo nunca fica inacessível).

## ⚠️ Pendências obrigatórias antes da publicação

1. **Número do CRO-ES**: não foi confirmado pelo cliente. O campo `cro` em
   `src/site.data.js` está vazio e o site omite o número (o footer exibe
   apenas "Cirurgião-Dentista · CRO-ES"). O site anterior exibia
   "CRO-ES 2126", mas esse valor não foi validado — **confirmar com o
   cliente e preencher o campo**.
2. **Horários de atendimento**: não confirmados. O site usa a formulação
   neutra "Consulte a disponibilidade de horários pelo WhatsApp"
   (campo `disponibilidade` em `src/site.data.js`).
3. **Grafia do logotipo**: o arquivo do logo (`assets-src/logo.jpg`) traz
   "GUARCONI" **sem cedilha**. O asset foi preservado como recebido; todo o
   texto do site usa "Guarçoni". Avaliar atualização do arquivo com o cliente.
4. **Domínio final**: `og:image` e o `image` do schema.org usam caminho
   relativo (`/images/retrato-01-og.jpg`). Ao definir o domínio, trocar por
   URL absoluta e adicionar `<link rel="canonical">`.
5. **Fotos do consultório**: não existem no material atual. A seção de
   "espaço/experiência da clínica" prevista no briefing foi absorvida por
   contato/localização até que existam fotos reais.
6. **Sedação consciente**: o site anterior menciona "opção de sedação".
   Por não constar da lista confirmada de serviços, a menção não foi
   incluída — validar com o cliente se deve entrar.
7. **Retrato adicional**: `assets-src/retrato-03.png` (close 168×210 px)
   ficou sem uso por resolução insuficiente.

## Ética (CFO)

Conteúdo sem promessa de resultado, sem depoimentos, sem antes/depois, sem
superlativos comparativos; aviso de caráter informativo no footer, em
conformidade com a Resolução CFO-196/2019.
