/* ============================================================================
   DADOS EDITÁVEIS DO SITE — Dr. Leonardo Pereira Guarçoni Duarte
   ----------------------------------------------------------------------------
   Este é o único lugar onde contatos, endereço, tratamentos e credenciais
   são definidos. O conteúdo é injetado no index.html durante o build
   (ver vite.config.js). Depois de alterar algo aqui, rode `npm run build`
   (ou apenas salve, se o `npm run dev` estiver aberto).

   PENDÊNCIA OBRIGATÓRIA ANTES DA PUBLICAÇÃO:
   - `cro`: número do CRO-ES ainda não confirmado pelo cliente. Enquanto o
     campo estiver vazio, o site omite o número (nunca publica um número falso).
   ========================================================================== */

export const site = {
  /* --- Identidade ---------------------------------------------------------- */
  nomeCompleto: 'Dr. Leonardo Pereira Guarçoni Duarte',
  nomeCurto: 'Dr. Leonardo Guarçoni',
  profissao: 'Cirurgião-Dentista',
  especialidade: 'Odontologia estética restauradora',

  /* CRO: deixe apenas o número, ex.: '2126'. Vazio = não exibe. */
  cro: '',
  croUf: 'ES',

  /* --- Contato ------------------------------------------------------------- */
  whatsappNumero: '5527998113025',
  whatsappDisplay: '(27) 99811-3025',
  whatsappMensagem: 'Olá! Gostaria de agendar uma avaliação com o Dr. Leonardo.',
  email: 'guarconieassociados@gmail.com',
  instagramUser: 'dr_leonardoguarconi',

  /* --- Endereço ------------------------------------------------------------ */
  endereco: {
    rua: 'Rua Henrique Laranja, 230',
    bairro: 'Centro',
    cidade: 'Vila Velha',
    uf: 'ES',
    cep: '29100-350',
  },

  /* Horários não confirmados pelo cliente: o site usa formulação neutra. */
  disponibilidade: 'Consulte a disponibilidade de horários pelo WhatsApp.',

  /* --- Formação (fatos confirmados) ---------------------------------------- */
  formacao: [
    {
      ano: '1991',
      titulo: 'Graduação em Odontologia',
      instituicao: 'Universidade Federal do Espírito Santo · UFES',
    },
    {
      ano: '1994',
      titulo: 'Pós-graduação em Endodontia',
      instituicao: 'Universidade Gama Filho · Rio de Janeiro',
    },
    {
      ano: 'Mais de 30 anos de trajetória',
      titulo: 'Odontologia estética restauradora',
      instituicao: 'Clínica própria em Vila Velha, ES',
    },
  ],

  /* --- Tratamentos (nomes e descrições do material do cliente) ------------- */
  tratamentos: [
    {
      nome: 'Implantes dentários',
      resumo:
        'Implantes são raízes artificiais de titânio fixadas no osso para repor dentes perdidos, servindo de suporte para coroas e próteses. O procedimento é planejado de forma individual, com avaliação prévia de cada caso.',
    },
    {
      nome: 'Ortodontia',
      resumo:
        'Especialidade que acompanha o crescimento e corrige o posicionamento dos dentes e da mordida. Existem aparelhos convencionais, autoligados e estéticos, e a escolha é definida na avaliação clínica.',
    },
    {
      nome: 'Próteses e clareamento',
      resumo:
        'A prótese reabilita dentes danificados ou ausentes, devolvendo função e estética. O clareamento ajuda a uniformizar a cor do sorriso, sempre com avaliação prévia da saúde bucal.',
    },
    {
      nome: 'Endodontia',
      resumo:
        'O tratamento de canal remove a parte interna inflamada ou infeccionada do dente, aliviando a dor e preservando o dente natural sempre que possível.',
    },
    {
      nome: 'Periodontia',
      resumo:
        'Cuida da saúde da gengiva e dos tecidos que sustentam os dentes, com foco em prevenir e tratar inflamações e a doença periodontal.',
    },
    {
      nome: 'Odontopediatria',
      resumo:
        'Atendimento odontológico voltado às crianças, com acolhimento e foco na prevenção desde os primeiros dentes, criando uma relação tranquila com o dentista.',
    },
    {
      nome: 'Cirurgias odontológicas',
      resumo:
        'Inclui extrações e pequenos procedimentos cirúrgicos da boca, realizados com planejamento, segurança e acompanhamento em cada etapa.',
    },
    {
      nome: 'Placas para bruxismo e ATM',
      resumo:
        'Placas individualizadas que protegem os dentes do aperto e do ranger, ajudando no conforto das articulações da mandíbula (ATM).',
    },
    {
      nome: 'Harmonização facial',
      resumo:
        'Procedimentos estéticos que realçam a harmonia natural da face, respeitando os traços de cada pessoa, com planejamento individual e leitura natural.',
    },
  ],

  /* --- Processo (pilares factuais de método, sem tecnologias inventadas) --- */
  processo: [
    {
      titulo: 'Escuta',
      texto: 'Toda relação começa por entender o que incomoda e o que você espera ver no espelho.',
    },
    {
      titulo: 'Avaliação',
      texto: 'Exame criterioso da saúde, da função e da estética do sorriso, sem pressa.',
    },
    {
      titulo: 'Diagnóstico',
      texto: 'A leitura técnica que dá nome ao problema e abre as possibilidades de tratamento.',
    },
    {
      titulo: 'Planejamento',
      texto: 'Um plano individual, desenhado para uma boca, um rosto e uma rotina.',
    },
    {
      titulo: 'Acompanhamento',
      texto: 'Cada etapa conferida de perto, do início do tratamento ao acabamento final.',
    },
    {
      titulo: 'Naturalidade',
      texto: 'O critério que fecha cada caso: um resultado que passa despercebido de tão seu.',
    },
  ],

  /* --- Metadata ------------------------------------------------------------ */
  meta: {
    title: 'Dr. Leonardo Guarçoni · Odontologia Estética Restauradora em Vila Velha, ES',
    description:
      'Cirurgião-dentista formado pela UFES, o Dr. Leonardo Guarçoni une saúde, função e estética em Vila Velha, ES. Implantes, ortodontia, próteses, endodontia e harmonização facial com atendimento humanizado. Agende pelo WhatsApp.',
  },
};

/* ============================================================================
   Derivados e helpers de template (não é preciso editar daqui para baixo)
   ========================================================================== */

export function derived() {
  const d = site;
  const waLink = `https://wa.me/${d.whatsappNumero}?text=${encodeURIComponent(d.whatsappMensagem)}`;
  const enderecoLinha = `${d.endereco.rua} · ${d.endereco.bairro}, ${d.endereco.cidade} · ${d.endereco.uf}`;
  const mapsQuery = encodeURIComponent(
    `${d.endereco.rua} - ${d.endereco.bairro}, ${d.endereco.cidade} - ${d.endereco.uf}, ${d.endereco.cep}`
  );
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const mapsEmbed = `https://www.google.com/maps?q=${mapsQuery}&output=embed&hl=pt-BR`;
  const croLinha = d.cro
    ? `${d.profissao} · CRO-${d.croUf} ${d.cro}`
    : `${d.profissao} · CRO-${d.croUf}`; /* número omitido até confirmação */

  return { ...d, waLink, enderecoLinha, mapsLink, mapsEmbed, croLinha };
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pad = (n) => String(n + 1).padStart(2, '0');

/* Lista de tratamentos: cada item carrega nome + resumo + CTA (disclosure).
   O JS marca o ativo, anima o palco e mantém um aberto por vez. */
export function renderTreatmentItems() {
  const wa = derived().waLink;
  return site.tratamentos
    .map(
      (t, i) => `
        <li class="tx-item" data-tx-item="${i}">
          <h3 class="tx-item-h">
            <button class="tx-name" type="button" id="tx-btn-${i}" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="tx-body-${i}" data-tx-btn="${i}">
              <span class="tx-num" aria-hidden="true">${pad(i)}</span>
              <span class="tx-word">${esc(t.nome)}</span>
            </button>
          </h3>
          <div class="tx-body" id="tx-body-${i}" data-tx-body="${i}"${i === 0 ? '' : ' hidden'}>
            <p class="tx-desc">${esc(t.resumo)}</p>
            <a class="btn btn-line" href="${wa}" target="_blank" rel="noopener noreferrer">
              Conversar sobre este tratamento
              <svg class="ico" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M2 8h11M9 3.5 13.5 8 9 12.5"/></svg>
            </a>
          </div>
        </li>`
    )
    .join('\n');
}

const treatmentVisuals = [
  {
    tone: 'pearl',
    note: 'raiz e suporte',
    svg: `<svg viewBox="0 0 420 420" aria-hidden="true"><path class="tv-main" d="M168 88c-38 18-57 59-43 101 9 27 25 42 29 76 4 31 12 62 33 62 17 0 19-43 31-43s14 43 31 43c21 0 29-31 33-62 4-34 20-49 29-76 14-42-5-83-43-101-27-13-46 7-50 7s-23-20-50-7Z"/><path d="M218 162v128"/><path d="M188 196h60"/><path d="M190 226h56"/><path d="M195 256h46"/></svg>`,
  },
  {
    tone: 'ivory',
    note: 'alinhamento',
    svg: `<svg viewBox="0 0 420 420" aria-hidden="true"><path class="tv-main" d="M86 222c44 68 204 68 248 0"/><path d="M118 206v43M164 222v45M210 228v45M256 222v45M302 206v43"/><path d="M105 198h26M151 214h26M197 220h26M243 214h26M289 198h26"/></svg>`,
  },
  {
    tone: 'stone',
    note: 'forma e luz',
    svg: `<svg viewBox="0 0 420 420" aria-hidden="true"><path class="tv-main" d="M146 122h128l34 74-98 116-98-116 34-74Z"/><path d="M146 122l64 190 64-190"/><path d="M112 104l-34-34M308 104l34-34M334 184h48M38 184h48"/></svg>`,
  },
  {
    tone: 'pearl',
    note: 'preservação',
    svg: `<svg viewBox="0 0 420 420" aria-hidden="true"><path class="tv-main" d="M148 92c-36 19-54 58-41 99 9 27 27 45 30 77 4 36 18 66 39 66 19 0 18-65 34-65s15 65 34 65c21 0 35-30 39-66 3-32 21-50 30-77 13-41-5-80-41-99-28-14-51 9-62 9s-34-23-62-9Z"/><path d="M210 136c-18 38-22 75-12 112"/><path d="M210 136c18 38 22 75 12 112"/><path d="M178 168h64"/></svg>`,
  },
  {
    tone: 'ivory',
    note: 'tecido de suporte',
    svg: `<svg viewBox="0 0 420 420" aria-hidden="true"><path class="tv-main" d="M102 224c34-40 64-40 94 0 30 40 60 40 94 0"/><path d="M140 126c-24 34-26 72-8 105"/><path d="M210 112c-20 42-20 84 0 126"/><path d="M280 126c24 34 26 72 8 105"/><path d="M116 270h188"/></svg>`,
  },
  {
    tone: 'stone',
    note: 'cuidado desde cedo',
    svg: `<svg viewBox="0 0 420 420" aria-hidden="true"><path class="tv-main" d="M160 130c-29 16-43 48-31 83 7 21 20 35 24 60 4 27 14 48 31 48 13 0 15-38 26-38s13 38 26 38c17 0 27-21 31-48 4-25 17-39 24-60 12-35-2-67-31-83-24-13-42 8-50 8s-26-21-50-8Z"/><path d="M96 106c30-34 70-52 114-52s84 18 114 52"/><path d="M108 322c31 29 65 43 102 43s71-14 102-43"/></svg>`,
  },
  {
    tone: 'pearl',
    note: 'gesto planejado',
    svg: `<svg viewBox="0 0 420 420" aria-hidden="true"><path class="tv-main" d="M105 286c55-94 126-148 210-162"/><path d="M154 246l58 58"/><path d="M210 190l58 58"/><path d="M122 314l46-46"/><path d="M252 184l62-62"/><circle cx="315" cy="124" r="18"/></svg>`,
  },
  {
    tone: 'ivory',
    note: 'proteção noturna',
    svg: `<svg viewBox="0 0 420 420" aria-hidden="true"><path class="tv-main" d="M96 214c37 70 191 70 228 0"/><path d="M126 194c44 42 124 42 168 0"/><path d="M132 246c48 32 108 32 156 0"/><path d="M112 164c50-42 146-42 196 0"/></svg>`,
  },
  {
    tone: 'stone',
    note: 'harmonia facial',
    svg: `<svg viewBox="0 0 420 420" aria-hidden="true"><path class="tv-main" d="M235 70c-54 22-80 70-72 128 5 38 28 66 68 92 22 15 21 42-6 60"/><path d="M226 132c25 5 43 18 54 39"/><path d="M196 212c34 20 65 19 94-4"/><circle cx="225" cy="158" r="5"/><circle cx="278" cy="210" r="5"/><circle cx="216" cy="288" r="5"/></svg>`,
  },
];

/* Palco dos tratamentos: diagramas semânticos, sem fotos clínicas inventadas
   e sem reutilizar retratos do Dr. Leonardo como imagem de serviço. */
export function renderTreatmentPlates() {
  return site.tratamentos
    .map((t, i) => {
      const visual = treatmentVisuals[i % treatmentVisuals.length];
      const tone = visual.tone;
      const word = esc(t.nome.split(' ')[0]);
      return `
        <figure class="plate plate--${tone}" data-tx-plate="${i}"${i === 0 ? ' data-active' : ''} aria-hidden="true">
          <span class="plate-rail" aria-hidden="true"></span>
          <span class="plate-num">${pad(i)}</span>
          <span class="plate-word">${word}</span>
          <span class="plate-name">${esc(t.nome)}</span>
          <span class="plate-note">${esc(visual.note)}</span>
          <span class="plate-visual">${visual.svg}</span>
        </figure>`;
    })
    .join('\n');
}

/* Etapas do processo: usadas no pin de desktop e na narrativa vertical. */
export function renderProcesso() {
  return site.processo
    .map(
      (p, i) => `
        <li class="passo" data-passo="${i}">
          <span class="passo-num" aria-hidden="true">${pad(i)}</span>
          <h3 class="passo-titulo">${esc(p.titulo)}</h3>
          <p class="passo-texto">${esc(p.texto)}</p>
        </li>`
    )
    .join('\n');
}

/* Marcos de formação. */
export function renderProcessDots() {
  return site.processo
    .map(
      (p, i) => `
        <span class="processo-dot${i === 0 ? ' is-active' : ''}" data-processo-dot="${i}">
          <i>${pad(i)}</i>
          <b>${esc(p.titulo)}</b>
        </span>`
    )
    .join('\n');
}

export function renderFormacao() {
  return site.formacao
    .map(
      (f) => `
        <li class="marco" data-marco>
          <span class="marco-ano">${esc(f.ano)}</span>
          <div class="marco-info">
            <h3 class="marco-titulo">${esc(f.titulo)}</h3>
            <p class="marco-inst">${esc(f.instituicao)}</p>
          </div>
        </li>`
    )
    .join('\n');
}

/* Schema.org — apenas dados confirmados (sem horários, sem avaliações). */
export function renderSchema() {
  const d = derived();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: d.nomeCompleto,
    alternateName: d.nomeCurto,
    description: d.meta.description,
    image: '/images/retrato-01-og.jpg',
    telephone: `+${d.whatsappNumero}`,
    email: d.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: d.endereco.rua,
      addressLocality: d.endereco.cidade,
      addressRegion: d.endereco.uf,
      postalCode: d.endereco.cep,
      addressCountry: 'BR',
    },
    sameAs: [`https://instagram.com/${d.instagramUser}`],
  };
  return JSON.stringify(schema, null, 2);
}
