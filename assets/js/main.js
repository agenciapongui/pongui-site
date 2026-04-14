/* ================================================================
   PONGUI — main.js
   Smooth scroll, tracking helpers e ajustes gerais.
   ================================================================ */

// Smooth scroll para âncoras internas (fallback p/ browsers sem scroll-behavior)
document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const href = link.getAttribute("href");
  if (href === "#" || href.length < 2) return;
  const target = document.querySelector(href);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });

  // Se for scroll pro formulário, tenta focar o primeiro botão/input
  if (href === "#formulario-hero" || href === "#formulario-final") {
    setTimeout(() => {
      const firstBtn = target.querySelector(".btn-primary, input");
      if (firstBtn) firstBtn.focus({ preventScroll: true });
    }, 500);
  }
});

// Intersection observer: dispara evento custom quando formulários entram/saem da viewport
// (útil pra tracking futuro: "form-hero-visible", "form-final-visible")
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (id) window.dispatchEvent(new CustomEvent("pongui:form-visible", { detail: { id } }));
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll(".form-qualificatorio").forEach(el => io.observe(el));
}

// Ajuste pra safe area no iOS (notch)
if (window.CSS && CSS.supports("padding: env(safe-area-inset-bottom)")) {
  document.documentElement.style.setProperty(
    "--safe-bottom",
    "env(safe-area-inset-bottom)"
  );
}
