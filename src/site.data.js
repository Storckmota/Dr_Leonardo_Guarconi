/* ============================================================================
   DADOS EDITÁVEIS DO SITE — Dr. Leonardo Pereira Guarçoni Duarte
   ----------------------------------------------------------------------------
   Este é o único lugar onde contatos, endereço, tratamentos e credenciais
   são definidos. O conteúdo é injetado no index.html durante o build
   (ver vite.config.js). Depois de alterar algo aqui, rode `npm run build`
   (ou apenas salve, se o `npm run dev` estiver aberto).

   PENDÊNCIA OBRIGATÓRIA ANTES DA PUBLICAÇÃO:
   - `cro`: número do CRO-ES ainda não confirmado pelo cliente. O site atual
     exibe "CRO-ES 2126", mas esse número não foi validado. Enquanto o campo
     estiver vazio, o site omite o número (nunca publica um número falso).
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
      ano: 'Hoje',
      titulo: 'Odontologia estética restauradora',
      instituicao: 'Consultório próprio · Vila Velha, ES',
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

  /* --- Metadata ------------------------------------------------------------ */
  meta: {
    title: 'Dr. Leonardo Guarçoni · Odontologia Estética Restauradora em Vila Velha, ES',
    description:
      'Cirurgião-dentista desde 1991, o Dr. Leonardo Guarçoni une saúde, função e estética em Vila Velha, ES. Implantes, ortodontia, próteses, endodontia e harmonização facial com atendimento humanizado. Agende pelo WhatsApp.',
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
  const croLinha = d.cro
    ? `${d.profissao} · CRO-${d.croUf} ${d.cro}`
    : `${d.profissao} · CRO-${d.croUf}`; /* número omitido até confirmação */

  return { ...d, waLink, enderecoLinha, mapsLink, croLinha };
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pad = (n) => String(n + 1).padStart(2, '0');

/* Índice de tratamentos: lista de tabs (aprimorada via JS para tablist). */
export function renderTreatmentIndex() {
  return site.tratamentos
    .map(
      (t, i) => `
        <li class="tx-row" role="presentation">
          <a class="tx-tab" id="tx-tab-${i}" href="#tx-panel-${i}" data-tx-tab="${i}">
            <span class="tx-num" aria-hidden="true">${pad(i)}</span>
            <span class="tx-name">${esc(t.nome)}</span>
            <span class="tx-mark" aria-hidden="true"></span>
          </a>
        </li>`
    )
    .join('\n');
}

/* Painéis estáticos: sem JS, todos visíveis; com JS viram tabpanels. */
export function renderTreatmentPanels() {
  const wa = derived().waLink;
  return site.tratamentos
    .map(
      (t, i) => `
        <article class="tx-panel" id="tx-panel-${i}" data-tx-panel="${i}" aria-labelledby="tx-tab-${i}">
          <p class="tx-panel-num" aria-hidden="true">${pad(i)}</p>
          <h3 class="tx-panel-title">${esc(t.nome)}</h3>
          <p class="tx-panel-body">${esc(t.resumo)}</p>
          <div class="tx-panel-actions">
            <a class="btn btn-line" href="${wa}" target="_blank" rel="noopener noreferrer">
              Conversar sobre este tratamento
              <svg class="ico" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M2 8h11M9 3.5 13.5 8 9 12.5"/></svg>
            </a>
            <a class="tx-panel-back" href="#tratamentos" data-tx-back hidden>Voltar ao índice</a>
          </div>
        </article>`
    )
    .join('\n');
}

/* Marcos de formação. */
export function renderFormacao() {
  return site.formacao
    .map(
      (f) => `
        <li class="marco">
          <span class="marco-ano">${esc(f.ano)}</span>
          <h3 class="marco-titulo">${esc(f.titulo)}</h3>
          <p class="marco-inst">${esc(f.instituicao)}</p>
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
