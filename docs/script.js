/* ==========================================================================
   KOLA — script.js
   Sommaire :
   1. Config rapide (à modifier facilement)
   2. Menu mobile
   3. Mode jour / nuit
   4. Animations au scroll (reveal)
   5. Mascotte — les yeux suivent le curseur
   6. Section GitHub — activité live (avec repli statique)
   7. Formulaire de contact (démo, sans backend)
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CONFIG — modifie juste ces valeurs pour connecter tes vrais comptes
-------------------------------------------------------------------------- */
const CONFIG = {
  githubUsername: "KolaEXE", // ex: "kola" — laisse vide pour garder les cartes statiques du HTML
  githubRepoLimit: 6,
};

/* --------------------------------------------------------------------------
   2. MENU MOBILE
-------------------------------------------------------------------------- */
const navBurger = document.getElementById("nav-burger");
const navLinks = document.getElementById("nav-links");

if (navBurger && navLinks) {
  navBurger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navBurger.classList.toggle("is-open", isOpen);
    navBurger.setAttribute("aria-expanded", String(isOpen));
    navBurger.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  });

  // Ferme le menu mobile après avoir cliqué sur un lien
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navBurger.classList.remove("is-open");
      navBurger.setAttribute("aria-expanded", "false");
    });
  });
}

/* --------------------------------------------------------------------------
   3. MODE JOUR / NUIT
   Note : le choix n'est pas sauvegardé entre les visites (pas de
   localStorage ici) — ajoute-le toi-même si tu héberges le site.
-------------------------------------------------------------------------- */
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = themeToggle ? themeToggle.querySelector(".theme-toggle-icon") : null;

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", isDark ? "light" : "dark");
    if (themeIcon) themeIcon.innerHTML = isDark ? '<i class="ph ph-sun-horizon"></i>' : '<i class="ph ph-moon-stars"></i>';
  });
}

/* --------------------------------------------------------------------------
   4. ANIMATIONS AU SCROLL
-------------------------------------------------------------------------- */
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // petit décalage pour un effet de vague sur les groupes de cartes
          setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  // Repli : tout est visible directement
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

/* --------------------------------------------------------------------------
   5. MASCOTTE — les yeux suivent le curseur
-------------------------------------------------------------------------- */
const mascot = document.getElementById("mascot");
const pupilLeft = document.getElementById("pupil-left");
const pupilRight = document.getElementById("pupil-right");

if (mascot && pupilLeft && pupilRight) {
  const maxOffset = 4; // amplitude du regard, en px

  const moveEyes = (clientX, clientY) => {
    const rect = mascot.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    const dx = Math.cos(angle) * maxOffset;
    const dy = Math.sin(angle) * maxOffset;

    pupilLeft.setAttribute("cx", 72 + dx);
    pupilLeft.setAttribute("cy", 108 + dy);
    pupilRight.setAttribute("cx", 128 + dx);
    pupilRight.setAttribute("cy", 108 + dy);
  };

  window.addEventListener("mousemove", (e) => moveEyes(e.clientX, e.clientY));

  // Petit clin d'oeil discret sur mobile : les yeux suivent le doigt au toucher
  window.addEventListener("touchmove", (e) => {
    if (e.touches[0]) moveEyes(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   6. SECTION GITHUB — activité live (optionnelle)
   Si CONFIG.githubUsername est renseigné, on tente de récupérer les vrais
   dépôts publics via l'API GitHub. En cas d'échec (offline, pseudo invalide,
   limite de requêtes...), les cartes statiques déjà présentes dans le HTML
   restent affichées — rien ne casse.
-------------------------------------------------------------------------- */
async function loadGithubActivity() {
  if (!CONFIG.githubUsername) return;

  const repoGrid = document.getElementById("repo-grid");
  if (!repoGrid) return;

  try {
    const res = await fetch(
      `https://api.github.com/users/${CONFIG.githubUsername}/repos?sort=updated&per_page=${CONFIG.githubRepoLimit}`
    );
    if (!res.ok) throw new Error("Réponse GitHub non valide");
    const repos = await res.json();
    if (!Array.isArray(repos) || repos.length === 0) return;

    repoGrid.innerHTML = "";
    repos.forEach((repo) => {
      const card = document.createElement("a");
      card.className = "repo-card";
      card.href = repo.html_url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.innerHTML = `
        <span class="repo-name">${repo.name}</span>
        <span class="repo-desc">${repo.description ? repo.description : "Pas de description pour le moment."}</span>
        <span class="repo-meta">
          <span class="repo-lang">${repo.language ? repo.language : "—"}</span>
          <span>★ ${repo.stargazers_count}</span>
        </span>
      `;
      repoGrid.appendChild(card);
    });

    // Met aussi à jour le compteur de dépôts publics affiché plus haut
    const statRepos = document.getElementById("stat-repos");
    if (statRepos) statRepos.textContent = repos.length;
  } catch (err) {
    // On garde silencieusement le repli statique déjà présent dans le HTML
    console.warn("Impossible de charger l'activité GitHub en direct :", err.message);
  }
}

loadGithubActivity();

/* --------------------------------------------------------------------------
   7. FORMULAIRE DE CONTACT
   Démo front-end uniquement : aucune donnée n'est envoyée nulle part.
   Branche ton propre endpoint (Formspree, backend, etc.) ici si besoin.
-------------------------------------------------------------------------- */
const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");

if (contactForm && formNote) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formNote.textContent = "Message prêt à partir — branche ce formulaire à ton service d'envoi préféré.";
    contactForm.reset();
  });
}
