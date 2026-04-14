/* ================================================================
   PONGUI — Formulário Multi-Step Qualificatório
   Uma classe MultiStepForm; 2 instâncias na página (hero + final).
   ================================================================ */

// ---- Configuração ----
// TODO: quando o CRM/webhook estiver pronto, troque FORM_ENDPOINT por
// a URL real (ex: "https://formspree.io/f/xxxxx") e defina POST_ENABLED
// para true. Enquanto false, o form redireciona direto para obrigado.html
// sem enviar dados.
const FORM_ENDPOINT = "";      // ex: "https://formspree.io/f/xxxxx"
const POST_ENABLED  = false;    // flip p/ true quando endpoint estiver configurado
const REDIRECT_URL  = "/obrigado.html";
const WHATSAPP_URL  = "https://tintim.link/whatsapp/050878cb-9389-412a-a6ef-42aa7e294c07/3553f9ea-ec50-4c24-b741-3ae7b0368b88";
const INSTAGRAM_URL = "https://www.instagram.com/agenciapongui/";

// ---- Classificador do lead ----
function classificarLead(faturamento, investimento) {
  if (faturamento === "acima_100k") return "mql_premium";
  if (faturamento === "50k_100k" || faturamento === "25k_50k") return "mql";
  if (faturamento === "10k_25k" && investimento && investimento !== "ate_1500") return "downsell";
  return "desqualificado";
}

// ---- Máscara de telefone (XX) XXXXX-XXXX ----
function maskPhone(value) {
  let v = value.replace(/\D/g, "").slice(0, 11);
  if (v.length >= 7)       v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  else if (v.length >= 3)  v = `(${v.slice(0,2)}) ${v.slice(2)}`;
  else if (v.length >= 1)  v = `(${v}`;
  return v;
}

// ---- Classe MultiStepForm ----
class MultiStepForm {
  constructor(container) {
    this.container = container;
    this.data = { nome: "", telefone: "", faturamento: "", investimento: "" };
    this.currentStep = "intro";   // intro | nome | tel | faturamento | investimento | aprovado | encerra
    this.stepHistory = [];
    this.render();
  }

  // mapa de steps com dot visível (1..4)
  getDotIndex() {
    const map = { nome: 1, tel: 2, faturamento: 3, investimento: 4, aprovado: 4 };
    return map[this.currentStep] || 0;
  }

  showDots() {
    return ["nome","tel","faturamento","investimento","aprovado"].includes(this.currentStep);
  }

  render() {
    const dotIdx = this.getDotIndex();
    const dotsHtml = this.showDots()
      ? `<div class="form-progress">
          ${[1,2,3,4].map(i => `<span class="progress-dot ${i <= dotIdx ? 'active':''}"></span>`).join("")}
        </div>`
      : `<div class="form-progress hidden"></div>`;

    this.container.innerHTML = `
      ${dotsHtml}
      <div class="form-steps">${this.renderStep()}</div>
    `;
    this.bindStep();
  }

  renderStep() {
    switch (this.currentStep) {
      case "intro": return this.stepIntro();
      case "nome": return this.stepNome();
      case "tel": return this.stepTelefone();
      case "faturamento": return this.stepFaturamento();
      case "investimento": return this.stepInvestimento();
      case "aprovado": return this.stepAprovado();
      case "encerra": return this.stepEncerra();
      case "erro": return this.stepErro();
    }
    return "";
  }

  // ---------- STEPS ----------
  stepIntro() {
    return `
      <div class="form-step active">
        <h3 class="form-title">Método Validado em +100 Escritórios de Advocacia</h3>
        <p class="form-desc">Escritórios que aplicaram nosso método fecharam até 80 contratos em um único mês. Responda 4 perguntas rápidas e entraremos em contato em até 5 minutos.</p>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" data-action="next-from-intro">COMEÇAR →</button>
        </div>
      </div>
    `;
  }

  stepNome() {
    return `
      <div class="form-step active">
        <label class="form-label" for="nome-${this.instanceId()}">Qual o seu nome completo?</label>
        <input class="form-input" id="nome-${this.instanceId()}" type="text" placeholder="Seu nome completo" autocomplete="name" value="${this.escape(this.data.nome)}" required>
        <div class="form-error" data-error="nome">Por favor, digite seu nome.</div>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" data-action="next-nome">PRÓXIMO →</button>
          <button type="button" class="btn-ghost" data-action="back">← Voltar</button>
        </div>
      </div>
    `;
  }

  stepTelefone() {
    return `
      <div class="form-step active">
        <label class="form-label" for="tel-${this.instanceId()}">Seu WhatsApp (com DDD)</label>
        <input class="form-input" id="tel-${this.instanceId()}" type="tel" placeholder="(00) 00000-0000" autocomplete="tel" value="${this.escape(this.data.telefone)}" required>
        <div class="form-error" data-error="tel">Telefone incompleto. Use o formato (XX) XXXXX-XXXX.</div>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" data-action="next-tel">PRÓXIMO →</button>
          <button type="button" class="btn-ghost" data-action="back">← Voltar</button>
        </div>
      </div>
    `;
  }

  stepFaturamento() {
    const opcoes = [
      ["ate_10k",    "Até R$ 10.000/mês"],
      ["10k_25k",    "R$ 10.000 a R$ 25.000/mês"],
      ["25k_50k",    "R$ 25.000 a R$ 50.000/mês"],
      ["50k_100k",   "R$ 50.000 a R$ 100.000/mês"],
      ["acima_100k", "Acima de R$ 100.000/mês"]
    ];
    return `
      <div class="form-step active">
        <label class="form-label">Qual o faturamento bruto mensal do seu escritório (média)?</label>
        <div class="form-radio-cards" role="radiogroup" aria-label="Faturamento">
          ${opcoes.map(([val,txt]) => `
            <button type="button" class="radio-card ${this.data.faturamento===val?'selected':''}" data-action="pick-faturamento" data-value="${val}">${txt}</button>
          `).join("")}
        </div>
        <div class="form-actions">
          <button type="button" class="btn-ghost" data-action="back">← Voltar</button>
        </div>
      </div>
    `;
  }

  stepInvestimento() {
    const opcoes = [
      ["ate_1500",    "Até R$ 1.500/mês"],
      ["1500_3000",   "R$ 1.500 a R$ 3.000/mês"],
      ["3000_5000",   "R$ 3.000 a R$ 5.000/mês"],
      ["acima_5000",  "Acima de R$ 5.000/mês"]
    ];
    return `
      <div class="form-step active">
        <label class="form-label">Quanto você pode investir por mês em marketing (agência + verba de anúncios)?</label>
        <div class="form-radio-cards" role="radiogroup" aria-label="Investimento">
          ${opcoes.map(([val,txt]) => `
            <button type="button" class="radio-card ${this.data.investimento===val?'selected':''}" data-action="pick-investimento" data-value="${val}">${txt}</button>
          `).join("")}
        </div>
        <div class="form-actions">
          <button type="button" class="btn-ghost" data-action="back">← Voltar</button>
        </div>
      </div>
    `;
  }

  stepAprovado() {
    return `
      <div class="form-step active">
        <h3 class="form-title">Ótimo! Seu escritório tem perfil.</h3>
        <p class="form-desc">Preencha abaixo e nosso time entra em contato em até 5 minutos.</p>
        <div class="form-review">
          <label class="form-label" for="nome-r-${this.instanceId()}">Nome</label>
          <input class="form-input" id="nome-r-${this.instanceId()}" type="text" value="${this.escape(this.data.nome)}" autocomplete="name" data-bind="nome">
          <label class="form-label" for="tel-r-${this.instanceId()}">WhatsApp</label>
          <input class="form-input" id="tel-r-${this.instanceId()}" type="tel" value="${this.escape(this.data.telefone)}" autocomplete="tel" data-bind="telefone">
        </div>
        <label class="form-checkbox-wrap">
          <input type="checkbox" id="aceito-${this.instanceId()}">
          <span>Concordo com a <a href="/privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a></span>
        </label>
        <div class="form-error-box" data-error-box style="display:none;"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" data-action="submit">ENVIAR →</button>
          <button type="button" class="btn-ghost" data-action="back">← Voltar</button>
        </div>
      </div>
    `;
  }

  stepEncerra() {
    return `
      <div class="form-step active">
        <h3 class="form-title">Obrigado pelo contato!</h3>
        <p class="form-desc">Nossa operação é formatada para atender escritórios que faturam a partir de R$ 10k/mês, então por enquanto não conseguimos te atender da melhor forma. Mas siga a Pongui no Instagram — publicamos conteúdos gratuitos de marketing jurídico toda semana que podem te ajudar a crescer!</p>
        <div class="form-actions">
          <a href="${INSTAGRAM_URL}" class="btn btn-primary" target="_blank" rel="noopener">SEGUIR A PONGUI NO INSTAGRAM →</a>
        </div>
      </div>
    `;
  }

  stepErro() {
    return `
      <div class="form-step active">
        <h3 class="form-title">Erro ao enviar.</h3>
        <p class="form-desc">Tente novamente ou entre em contato pelo WhatsApp.</p>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" data-action="retry">TENTAR NOVAMENTE</button>
          <a href="${WHATSAPP_URL}" target="_blank" rel="noopener" class="btn btn-primary" style="background:var(--cor-whatsapp);">
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i> CHAMAR NO WHATSAPP
          </a>
        </div>
      </div>
    `;
  }

  // ---------- BIND ----------
  bindStep() {
    const root = this.container;

    // Máscara telefone
    const telInput = root.querySelector('input[type="tel"]');
    if (telInput) {
      telInput.addEventListener("input", (e) => {
        e.target.value = maskPhone(e.target.value);
      });
    }

    // Delegação de clicks por data-action
    root.addEventListener("click", this.handleClick.bind(this), { once: true });

    // Focus em input de texto/tel se houver
    const autoFocusEl = root.querySelector(".form-step.active input");
    if (autoFocusEl && this.currentStep !== "aprovado") {
      setTimeout(() => autoFocusEl.focus(), 50);
    }
  }

  handleClick(e) {
    const target = e.target.closest("[data-action]");
    if (!target) {
      this.bindStep(); // re-bind pra próximo click (listener é once)
      return;
    }
    const action = target.dataset.action;

    switch (action) {
      case "next-from-intro":
        this.goTo("nome"); break;

      case "next-nome":
        this.handleNextNome(); break;

      case "next-tel":
        this.handleNextTel(); break;

      case "pick-faturamento":
        this.handlePickFaturamento(target.dataset.value); break;

      case "pick-investimento":
        this.handlePickInvestimento(target.dataset.value); break;

      case "submit":
        this.handleSubmit(); break;

      case "back":
        this.handleBack(); break;

      case "retry":
        this.goTo("aprovado"); break;
    }
  }

  // ---------- VALIDAÇÃO + AVANÇO ----------
  handleNextNome() {
    const input = this.container.querySelector('input[type="text"]');
    const value = (input.value || "").trim();
    if (value.length < 2) {
      this.showError("nome");
      return;
    }
    this.data.nome = value;
    this.goTo("tel");
  }

  handleNextTel() {
    const input = this.container.querySelector('input[type="tel"]');
    const value = (input.value || "").trim();
    if (value.length < 14) { // (XX) XXXXX-XXXX = 15, mas aceita com 10 dígitos também via máscara
      this.showError("tel");
      return;
    }
    this.data.telefone = value;
    this.goTo("faturamento");
  }

  handlePickFaturamento(value) {
    this.data.faturamento = value;
    if (value === "ate_10k")     this.goTo("encerra");
    else if (value === "10k_25k") this.goTo("investimento");
    else                          this.goTo("aprovado");
  }

  handlePickInvestimento(value) {
    this.data.investimento = value;
    if (value === "ate_1500") this.goTo("encerra");
    else                      this.goTo("aprovado");
  }

  handleBack() {
    const prev = this.stepHistory.pop();
    if (prev) {
      this.currentStep = prev;
      this.render();
    }
  }

  // ---------- SUBMIT ----------
  async handleSubmit() {
    // Captura edições nos inputs de revisão
    const nomeInput = this.container.querySelector('[data-bind="nome"]');
    const telInput  = this.container.querySelector('[data-bind="telefone"]');
    if (nomeInput) this.data.nome = nomeInput.value.trim();
    if (telInput)  this.data.telefone = telInput.value.trim();

    if (this.data.nome.length < 2 || this.data.telefone.length < 14) {
      this.showErrorBox("Preencha seu nome e WhatsApp completo antes de enviar.");
      return;
    }

    const payload = {
      nome: this.data.nome,
      telefone: this.data.telefone,
      faturamento: this.data.faturamento,
      investimento: this.data.investimento || null,
      timestamp: new Date().toISOString(),
      origem: window.location.href,
      classificacao: classificarLead(this.data.faturamento, this.data.investimento)
    };

    // Salva no sessionStorage pra eventual recuperação
    try { sessionStorage.setItem("pongui_last_lead", JSON.stringify(payload)); } catch(_) {}

    // POST desligado por padrão → redirect direto
    if (!POST_ENABLED || !FORM_ENDPOINT) {
      window.location.href = REDIRECT_URL;
      return;
    }

    // POST (quando ativado)
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      window.location.href = REDIRECT_URL;
    } catch (err) {
      console.error("[Pongui form]", err);
      this.goTo("erro");
    }
  }

  // ---------- HELPERS ----------
  goTo(step) {
    if (this.currentStep !== step) this.stepHistory.push(this.currentStep);
    this.currentStep = step;
    this.render();
  }

  showError(key) {
    const el = this.container.querySelector(`[data-error="${key}"]`);
    if (el) el.classList.add("visible");
    // rebind p/ permitir novo clique
    this.bindStep();
  }

  showErrorBox(msg) {
    const box = this.container.querySelector("[data-error-box]");
    if (box) {
      box.textContent = msg;
      box.style.display = "block";
    }
    this.bindStep();
  }

  escape(str) {
    return (str || "").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  instanceId() {
    return this.container.dataset.formInstance || "form";
  }
}

// ---- Inicialização ----
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".form-qualificatorio").forEach(el => new MultiStepForm(el));
});
