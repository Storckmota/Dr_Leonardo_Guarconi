# Dr. Leonardo Guarçoni — Site institucional (direção Aventura)

One page do Dr. Leonardo Pereira Guarçoni Duarte, cirurgião-dentista
especialista em odontologia estética restauradora, em Vila Velha, ES.
Direção atual: arquitetura em capítulos com coreografia de rolagem
(GSAP + ScrollTrigger), smooth scroll (Lenis) e paleta luminosa extraída do
logotipo pessoal: porcelana dominante, grafite quente para tipografia e
blocos escuros pontuais, greige de apoio, dourado/cobre da marca como acento.

## Como rodar

```bash
npm install        # primeira vez
npm run dev        # desenvolvimento (http://localhost:5173)
npm run build      # build de produção → dist/
npm run preview    # serve o build (http://localhost:4173)
npm run images     # regenera public/images a partir de assets-src/
node scripts/prepare-logo.mjs   # regenera derivados do logo (logo.jpg da raiz)
```

## Onde editar conteúdo

Dados editáveis (contatos, endereço, tratamentos, processo, formação, CRO,
mensagem do WhatsApp, metadata) em **`src/site.data.js`** — injetados no
`index.html` no build (plugin em `vite.config.js`). Textos dos capítulos
(hero, missão, doutor, filosofia, CTA) direto no `index.html`.

## Estrutura

```
index.html                  10 capítulos (preloader→header/menu→hero→missão→
                            tratamentos→processo→doutor→filosofia→mapa→CTA/footer)
logo.jpg                    logo original do cliente (584×584, preservado)
src/site.data.js            fonte única de dados editáveis
src/main.js                 orquestração (funcional × coreografia)
src/js/
  context.js                gsap+ScrollTrigger registrados, flags de motion
  smooth.js                 Lenis + integração ScrollTrigger + âncoras
  split.js                  split de títulos em linhas mascaradas
  preloader.js              marca + linha, sessionStorage, teto de tempo
  header.js                 estado de rolagem + tema claro/escuro por capítulo
  menu.js                   overlay tela cheia (wipe + cascata + trap de foco)
  hero.js                   timeline de entrada + camadas nos primeiros pixels
  reveals.js                splits, máscaras, parallax, ghosts, viagem de cor
  treatments.js             lista + palco de placas + autoplay pausável
  process.js                capítulo pinado com 6 etapas (scrub, só desktop)
  mapa.js                   iframe lazy + revelação por máscara
src/styles/                 fonts / tokens / base / chapters
scripts/prepare-logo.mjs    corta margens e remove fundo branco do logo
scripts/optimize-images.mjs retratos → WebP (+ recorte macro do rosto)
scripts/qa.mjs              QA Playwright (console, overflow, interações,
                            reduced-motion) — requer `npm run preview`
scripts/shoot-sections.mjs  screenshots por seção (m390 + d1440)
scripts/contrast.mjs        auditoria WCAG dos tokens
```

## Motion

- **Lenis** para smooth scroll (wheel; toque permanece nativo), integrado ao
  ScrollTrigger via `gsap.ticker`.
- **GSAP/ScrollTrigger**: preloader, timeline do hero, reveals por linha,
  máscaras de imagem, parallax, pin do processo (6 etapas com contador e
  linha), palco de tratamentos, revelação do mapa, viagem de cor do fundo,
  header temático.
- **prefers-reduced-motion**: nada é escondido, sem Lenis, sem pin, troca de
  placas instantânea; preloader não aparece.
- **Sem JS**: conteúdo integral visível; mapa carrega via `<noscript>`.

## ⚠️ Pendências obrigatórias antes da publicação

1. **Número do CRO-ES**: campo `cro` vazio em `src/site.data.js`; o site
   omite o número (footer exibe "Cirurgião-Dentista · CRO-ES"). Confirmar e
   preencher apenas com dado validado.
2. **Horários**: não confirmados; formulação neutra via WhatsApp
   (campo `disponibilidade`).
3. **Domínio final**: trocar `og:image`/schema para URL absoluta e
   adicionar `<link rel="canonical">`.
4. **Fotos reais**: não há imagens da clínica/atendimento; a foto genérica
   de casal da v1 foi removida. Hero e seção do doutor usam retratos reais;
   tratamentos usam diagramas semânticos. Sessão fotográfica recomendada
   (consultório, detalhes, atendimento) para elevar futuras versões.
5. **Grafia do logo**: o arquivo novo (`logo.jpg`) traz "GUARÇONI" com
   cedilha — pendência da v1 resolvida pelo cliente.

## Ética (CFO)

Sem promessa de resultado, sem depoimentos, sem antes/depois, sem
superlativos; aviso informativo no footer (Resolução CFO-196/2019).
