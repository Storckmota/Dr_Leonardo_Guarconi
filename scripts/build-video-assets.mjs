/* ============================================================================
   BUILD DE ATIVOS DE VÍDEO — Dr. Leonardo Guarçoni
   ----------------------------------------------------------------------------
   Quatro filmes, um por capítulo audiovisual. Cada filme é uma montagem real
   com começo, desenvolvimento e fechamento — não um microclipe.

     hero-leonardo      ~20,7 s   o Dr. Leonardo trabalhando (abertura)
     precisao-trabalho  ~13,4 s   campo operatório, equipe e gesto
     filosofia-escuta    ~8,6 s   proximidade, mão que apoia o rosto
     clinica-guarconi   ~20,7 s   o consultório: chegada, recepção, ambientes

   PRINCÍPIOS
   - Os arquivos originais em `SOURCES` são SOMENTE LEITURA. Nada aqui grava,
     renomeia ou move um original.
   - Nenhum intervalo é usado em dois filmes. O mapa abaixo é a fonte da
     verdade e cobre 45,25 s dos ~46,5 s de material limpo disponível.
   - As fontes são HLG/BT.2020 (HDR). A conversão para SDR é explícita:
     linearizar → tonemap hable → BT.709. Nunca marcar como 709 sem converter.
   - A velocidade reduzida é uma decisão editorial declarada: o material é uma
     edição social acelerada e o site precisa de respiração. As razões usadas
     (0,75 / 0,65 / 0,60) dão cadências de duplicação regulares a 30 fps.
   - Todo filme fecha com um crossfade de laço (a cauda dissolve na cabeça),
     então o `loop` do <video> não tem emenda visível.

   USO:  npm run video          (tudo)
         npm run video -- hero  (só os filmes cujo id contém "hero")
   ========================================================================== */

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const SOURCES = 'C:/Users/storc/Downloads';
const WORK = 'assets-src/video/edit/render';
const OUT = 'public/videos';

/* HLG/BT.2020 → SDR BT.709. `npl=100` mantém as luzes práticas âmbar com
   forma; `desat=0` impede que o hable lave a pele quente. */
const TONEMAP =
  'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,' +
  'tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv';

/* ALINHAMENTO DE MACROBLOCO — por que 1072x1824 e não 1080x1826
   ---------------------------------------------------------------------------
   H.264 codifica em macroblocos de 16x16 e VP9 em blocos de 16 para cima. Uma
   altura de 1826 não é múltipla de 16: o decodificador aloca 1840 linhas e as
   14 linhas excedentes ficam com croma zerado — que em YUV é VERDE ESCURO.
   Elas não aparecem quando o quadro é decodificado por software (o ffmpeg
   recorta corretamente), mas aparecem no caminho de overlay de vídeo da GPU,
   que compõe o buffer inteiro. Era essa a faixa verde no topo de Precisão: a
   única composição do site que amostrava a borda exata da textura
   (`object-position: 50% 0%`), justamente onde o preenchimento entra.

   Medido na gravação: faixa de 12–13 px de altura sobre um vídeo reduzido a
   0,944 → 12,7–13,8 linhas de origem. Casa com as 14 linhas de preenchimento.

   1072x1824 e 720x1216 são múltiplos de 16 nos dois eixos: não existe
   preenchimento para vazar. O corte em relação ao enquadramento anterior é de
   0,74% na largura e 0,11% na altura — imperceptível, e nenhum corte, duração,
   velocidade, cor ou laço muda. */
const GEOMETRY = {
  'IMG_0517.MOV': 'scale=1072:1824:flags=lanczos', // 720x1218 → ~1,49x (upscale moderado)
  'IMG_9677.MOV': 'crop=1072:1824:4:2',            // 1080x1828 → janela centrada
  'IMG_9681.MOV': 'crop=1072:1824:4:48',           // 1080x1920 → mesma janela central de antes
};

const MASTER_W = 1072;
const MASTER_H = 1824;
const MOBILE_W = 720;
const MOBILE_H = 1216;

/* ---------------------------------------------------------------------------
   MAPA DE CORTE
   `speed` < 1 desacelera. `wrap` é o crossfade de laço no fim do filme.
   `dissolve` > 0 troca os cortes secos por fusões entre os atos.
   --------------------------------------------------------------------------- */
const FILMS = [
  {
    id: 'hero-leonardo',
    role: 'hero',
    speed: 0.75,
    wrap: 0.5,
    dissolve: 0,
    posterAt: 1.2,
    note: 'Leonardo com lupa → perfil em contraluz → sob a luminária → viseira → abre para o campo operatório',
    segments: [
      { src: 'IMG_0517.MOV', in: 15.70, out: 19.30, scene: 'lupa clínica, rosto visível, instrumento em ação' },
      { src: 'IMG_0517.MOV', in: 39.70, out: 42.90, scene: 'perfil recortado em contraluz pelo negatoscópio' },
      { src: 'IMG_0517.MOV', in: 43.35, out: 46.10, scene: 'por trás do ombro, sob a luminária quente' },
      { src: 'IMG_0517.MOV', in: 51.95, out: 53.90, scene: 'perfil de viseira, luz laranja da luminária' },
      /* Fecha abrindo o plano: o mundo em volta dele, antes do laço. */
      { src: 'IMG_0517.MOV', in: 46.25, out: 51.85, scene: 'campo operatório com a equipe, plano mais aberto' },
    ],
  },
  {
    id: 'precisao-trabalho',
    role: 'precision',
    speed: 0.60,
    wrap: 0.5,
    dissolve: 0,
    posterAt: 2.0,
    /* Os três planos foram escolhidos pela POSIÇÃO da legenda queimada na
       fonte, não só pelo conteúdo: aqui o corte é ancorado no topo, e nestes
       planos a legenda cai fora do quadro (55,50–59,90 e o trecho do 9677) ou
       no terço inferior (29,60–32,85). É a forma de a seção ter uma manchete
       só — a do site — sem encolher a mídia. */
    segments: [
      { src: 'IMG_0517.MOV', in: 55.50, out: 59.90, scene: 'lanterna de cabeça, rosto visível, trabalho no escuro' },
      { src: 'IMG_9677.MOV', in: 7.30, out: 8.90, scene: 'mão enluvada conduzindo instrumento fino no rosto' },
      { src: 'IMG_0517.MOV', in: 29.60, out: 32.85, scene: 'plano alto, lanterna de cabeça, instrumento em ação' },
    ],
  },
  {
    id: 'filosofia-escuta',
    role: 'philosophy',
    speed: 0.60,
    wrap: 0.5,
    dissolve: 0.4,
    posterAt: 2.0,
    note: 'mão que apoia o rosto → instrumento que percorre a linha do lábio',
    segments: [
      /* SAI EM 2,85 E NÃO EM 3,70 — o letreiro publicitário do original.
         Em IMG_9681 a cartela "DR. LEONARDO GUARÇONI" começa a surgir em
         t=3,00 e "REALCE A SUA MELHOR VERSÃO." em t=3,40 (medido quadro a
         quadro a 10fps na banda y=760..1080). O corte antigo levava 0,70s
         dessa cartela para dentro do filme, e ela aparecia por cima da cena
         justamente na dissolvência entre os dois atos. 2,85 deixa 0,15s de
         margem antes do primeiro pixel de texto. */
      { src: 'IMG_9681.MOV', in: 1.00, out: 2.85, scene: 'mão enluvada apoiando o rosto, luz quente rasante' },
      /* fecha em 16,30 e não em 16,90: depois disso a luva domina o quadro */
      { src: 'IMG_9677.MOV', in: 13.45, out: 16.30, scene: 'gesto contido acompanhando o contorno do rosto' },
    ],
  },
  {
    id: 'clinica-guarconi',
    role: 'clinic',
    /* 0,50x: o travelling da recepção é um movimento de gimbal já lento; a
       metade da velocidade transforma a passagem em percurso contemplativo e
       dá a cadência de duplicação mais limpa possível a 30 fps (1:2). */
    speed: 0.50,
    wrap: 0.6,
    dissolve: 0,
    posterAt: 5.0,
    note: 'recepção → corredor → sala de espera e arte → equipamento da sala clínica',
    segments: [
      /* O plano de abertura (0,15–2,05) foi descartado: a cartela queimada
         "Dr Leonardo Guarçoni · CRO-ES 2126" fica gigante numa superfície
         desta escala e disputa com a própria marca do site. */
      { src: 'IMG_0517.MOV', in: 3.30, out: 11.80, scene: 'travelling: recepção, corredor, espera, obra de arte' },
      { src: 'IMG_0517.MOV', in: 12.70, out: 15.05, scene: 'luminária e equipamento da sala clínica' },
    ],
  },
];

/* --------------------------------------------------------------------------- */

function ff(args, label) {
  try {
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
      stdio: ['ignore', 'inherit', 'inherit'],
    });
  } catch (err) {
    console.error(`\n✗ falhou: ${label}`);
    throw err;
  }
}

function probe(file, entries) {
  return execFileSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', entries, '-of', 'default=noprint_wrappers=1:nokey=1', file],
    { encoding: 'utf8' }
  )
    .trim()
    .split('\n');
}

const round3 = (n) => Math.round(n * 1000) / 1000;

/* Etapa 1 — cada segmento vira um intermediário já em SDR, já na velocidade e
   já no quadro-mestre. Intermediário em CRF 14: perda irrelevante nas duas
   passagens seguintes. */
function renderSegment(film, seg, i) {
  const srcPath = path.join(SOURCES, seg.src);
  const dst = path.join(WORK, `${film.id}-${String(i + 1).padStart(2, '0')}.mp4`);
  const pts = round3(1 / film.speed);
  const chain = [
    `trim=start=${seg.in}:end=${seg.out}`,
    'setpts=PTS-STARTPTS',
    TONEMAP,
    GEOMETRY[seg.src],
    `setpts=${pts}*PTS`,
    'fps=30',
    'format=yuv420p',
  ].join(',');

  ff(
    [
      '-i', srcPath,
      '-an', '-sn', '-dn',
      '-vf', chain,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      dst,
    ],
    `segmento ${film.id} #${i + 1} (${seg.src} ${seg.in}–${seg.out})`
  );
  return dst;
}

/* Etapa 2 — junta os atos. Corte seco pelo demuxer concat; fusão pelo xfade. */
function joinSegments(film, parts) {
  const joined = path.join(WORK, `${film.id}-joined.mp4`);

  if (!film.dissolve) {
    const listFile = path.join(WORK, `${film.id}-list.txt`);
    writeFileSync(
      listFile,
      parts.map((p) => `file '${path.resolve(p).replace(/\\/g, '/')}'`).join('\n')
    );
    ff(['-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', joined], `concat ${film.id}`);
    return joined;
  }

  /* xfade encadeado: cada offset é o acumulado menos as fusões já gastas. */
  const durs = parts.map((p) => Number(probe(p, 'format=duration')[0]));
  const inputs = parts.flatMap((p) => ['-i', p]);
  const chain = [];
  let prev = '0:v';
  let acc = durs[0];
  for (let i = 1; i < parts.length; i += 1) {
    const label = i === parts.length - 1 ? 'out' : `x${i}`;
    const offset = round3(acc - film.dissolve);
    chain.push(`[${prev}][${i}:v]xfade=transition=fade:duration=${film.dissolve}:offset=${offset}[${label}]`);
    prev = label;
    acc = offset + film.dissolve + (durs[i] - film.dissolve);
  }

  ff(
    [
      ...inputs,
      '-filter_complex', chain.join(';'),
      '-map', '[out]',
      '-an',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      joined,
    ],
    `xfade ${film.id}`
  );
  return joined;
}

/* Etapa 3 — laço sem emenda.
   Com F de duração D e janela w, o mestre é F[w..D] com os últimos w segundos
   dissolvidos em F[0..w]. O último quadro passa a ser F(w) — exatamente o
   primeiro quadro do mestre. O `loop` do <video> fecha sem salto. */
function wrapLoop(film, joined) {
  const master = path.join(WORK, `${film.id}-master.mp4`);
  const D = Number(probe(joined, 'format=duration')[0]);
  const w = film.wrap;
  const offset = round3(D - 2 * w);

  const filter = [
    `[0:v]trim=start=${w},setpts=PTS-STARTPTS[body]`,
    `[1:v]trim=start=0:end=${w},setpts=PTS-STARTPTS[head]`,
    `[body][head]xfade=transition=fade:duration=${w}:offset=${offset}[out]`,
  ].join(';');

  ff(
    [
      '-i', joined, '-i', joined,
      '-filter_complex', filter,
      '-map', '[out]',
      '-an',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      master,
    ],
    `wrap ${film.id}`
  );
  return master;
}

/* Etapa 4 — entregáveis. */
const H264 = (crf) => [
  '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0',
  '-preset', 'slow', '-crf', String(crf),
  '-pix_fmt', 'yuv420p', '-g', '60', '-keyint_min', '30',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
  '-movflags', '+faststart', '-an',
];

const VP9 = (crf, cpu) => [
  '-c:v', 'libvpx-vp9', '-crf', String(crf), '-b:v', '0',
  '-row-mt', '1', '-deadline', 'good', '-cpu-used', String(cpu),
  '-pix_fmt', 'yuv420p', '-g', '60',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
  '-an',
];

function deliver(film, master) {
  const base = path.join(OUT, film.id);
  const mob = `scale=${MOBILE_W}:${MOBILE_H}:flags=lanczos`;

  ff(['-i', master, ...H264(24), `${base}-desktop.mp4`], `mp4 desktop ${film.id}`);
  ff(['-i', master, '-vf', mob, ...H264(25), `${base}-mobile.mp4`], `mp4 mobile ${film.id}`);
  ff(['-i', master, ...VP9(34, 3), `${base}-desktop.webm`], `webm desktop ${film.id}`);
  ff(['-i', master, '-vf', mob, ...VP9(35, 4), `${base}-mobile.webm`], `webm mobile ${film.id}`);

  /* Poster escolhido dentro do corte (não o quadro 0, que em três dos quatro
     filmes é o ponto mais escuro do laço). Com reduced-motion o poster é a
     peça inteira, então ele precisa valer por si.

     Um poster só para os dois viewports: `poster` não aceita `srcset`, é o
     MESMO quadro nos dois casos e 1080 px de largura ainda é nítido em telas
     3x. Trocar o arquivo por JS provocaria um repaint visível à toa. */
  const at = String(film.posterAt ?? 0);
  ff(
    ['-ss', at, '-i', master, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '84', `${base}-poster.webp`],
    `poster ${film.id}`
  );
}

/* --------------------------------------------------------------------------- */

function main() {
  const filter = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const todo = filter.length ? FILMS.filter((f) => filter.some((q) => f.id.includes(q))) : FILMS;
  if (!todo.length) {
    console.error('nenhum filme corresponde ao filtro:', filter.join(' '));
    process.exit(1);
  }

  for (const f of FILMS) {
    for (const s of f.segments) {
      const p = path.join(SOURCES, s.src);
      if (!existsSync(p)) {
        console.error(`✗ original ausente: ${p}`);
        process.exit(1);
      }
    }
  }

  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  mkdirSync(OUT, { recursive: true });

  const report = [];

  for (const film of todo) {
    console.log(`\n▸ ${film.id} — ${film.segments.length} atos, ${film.speed}x`);
    const parts = film.segments.map((seg, i) => renderSegment(film, seg, i));
    const joined = joinSegments(film, parts);
    const master = wrapLoop(film, joined);
    deliver(film, master);

    const dur = Number(probe(master, 'format=duration')[0]);
    report.push({ id: film.id, duration: dur });
    console.log(`  ✓ ${dur.toFixed(2)}s · mestre ${MASTER_W}x${MASTER_H}`);
  }

  console.log('\n── entregues em public/videos ─────────────────────────────');
  for (const r of report) {
    for (const suffix of ['-desktop.mp4', '-mobile.mp4', '-desktop.webm', '-mobile.webm', '-poster.webp']) {
      const f = path.join(OUT, r.id + suffix);
      if (existsSync(f)) {
        const kb = (statSync(f).size / 1024).toFixed(0);
        console.log(`  ${(r.id + suffix).padEnd(38)} ${String(kb).padStart(6)} KB`);
      }
    }
  }
  console.log(`\n  originais intactos em ${SOURCES} (somente leitura)\n`);
}

main();
