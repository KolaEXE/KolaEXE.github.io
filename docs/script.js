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
   BARRE DE DÉFILEMENT PERSONNALISÉE
-------------------------------------------------------------------------- */
const customScrollbarQuery = window.matchMedia("(min-width: 761px)");
const initialDevicePixelRatio = window.devicePixelRatio || 1;
let customScrollbar = null;
let customScrollbarThumb = null;
let customScrollbarFrame = 0;
let scrollbarDragPointerId = null;
let scrollbarDragOffset = 0;
let previousScrollBehavior = "";

const updateCustomScrollbarThickness = () => {
  if (!customScrollbar) return;

  const currentDevicePixelRatio = window.devicePixelRatio || initialDevicePixelRatio;
  const zoomCompensation = initialDevicePixelRatio / currentDevicePixelRatio;
  customScrollbar.style.setProperty("--custom-scrollbar-track-width", `${12 * zoomCompensation}px`);
  customScrollbar.style.setProperty("--custom-scrollbar-thumb-width", `${8 * zoomCompensation}px`);
  customScrollbar.style.setProperty("--custom-scrollbar-thumb-left", `${2 * zoomCompensation}px`);
};

const updateCustomScrollbar = () => {
  customScrollbarFrame = 0;
  if (!customScrollbar || !customScrollbarThumb) return;

  const viewportHeight = window.innerHeight;
  const documentHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );
  const scrollRange = documentHeight - viewportHeight;
  const thumbHeight = Math.min(
    viewportHeight,
    Math.max(36, viewportHeight * viewportHeight / documentHeight)
  );
  const thumbRange = viewportHeight - thumbHeight;

  customScrollbar.hidden = scrollRange <= 0;
  customScrollbar.setAttribute("aria-valuemax", String(Math.ceil(scrollRange)));
  customScrollbar.setAttribute("aria-valuenow", String(Math.round(window.scrollY)));
  customScrollbarThumb.style.height = `${thumbHeight}px`;
  customScrollbarThumb.style.transform = `translateY(${
    scrollRange > 0 ? window.scrollY / scrollRange * thumbRange : 0
  }px)`;
};

const scheduleCustomScrollbarUpdate = () => {
  if (!customScrollbarFrame) {
    customScrollbarFrame = window.requestAnimationFrame(updateCustomScrollbar);
  }
};

const setCustomScrollbarEnabled = () => {
  if (customScrollbarQuery.matches) {
    if (customScrollbar) {
      updateCustomScrollbarThickness();
      scheduleCustomScrollbarUpdate();
      return;
    }

    customScrollbar = document.createElement("div");
    customScrollbar.className = "custom-scrollbar";
    customScrollbar.setAttribute("role", "scrollbar");
    customScrollbar.setAttribute("aria-label", "Défilement de la page");
    customScrollbar.setAttribute("aria-orientation", "vertical");
    customScrollbar.setAttribute("aria-valuemin", "0");
    customScrollbar.tabIndex = 0;
    customScrollbarThumb = document.createElement("div");
    customScrollbarThumb.className = "custom-scrollbar-thumb";
    customScrollbar.append(customScrollbarThumb);
    document.body.append(customScrollbar);
    document.documentElement.classList.add("custom-scrollbar-active");
    updateCustomScrollbarThickness();

    const scrollFromPointer = (clientY) => {
      const viewportHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      const scrollRange = documentHeight - viewportHeight;
      const thumbRange = viewportHeight - customScrollbarThumb.offsetHeight;
      const thumbTop = Math.max(
        0,
        Math.min(thumbRange, clientY - scrollbarDragOffset)
      );
      if (thumbRange > 0) {
        window.scrollTo(0, thumbTop / thumbRange * scrollRange);
      }
    };

    customScrollbar.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      scrollbarDragPointerId = event.pointerId;
      scrollbarDragOffset = event.target === customScrollbarThumb
        ? event.clientY - customScrollbarThumb.getBoundingClientRect().top
        : customScrollbarThumb.offsetHeight / 2;
      previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      customScrollbar.classList.add("is-dragging");
      document.documentElement.classList.add("is-scrollbar-dragging");
      customScrollbar.setPointerCapture(event.pointerId);
      if (event.target !== customScrollbarThumb) {
        scrollFromPointer(event.clientY);
      }
    });

    customScrollbar.addEventListener("pointermove", (event) => {
      if (event.pointerId !== scrollbarDragPointerId) return;
      scrollFromPointer(event.clientY);
    });

    const finishScrollbarDrag = (event) => {
      if (event.pointerId !== scrollbarDragPointerId) return;
      scrollbarDragPointerId = null;
      customScrollbar.classList.remove("is-dragging");
      document.documentElement.classList.remove("is-scrollbar-dragging");
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    };
    customScrollbar.addEventListener("pointerup", finishScrollbarDrag);
    customScrollbar.addEventListener("pointercancel", finishScrollbarDrag);
    customScrollbar.addEventListener("keydown", (event) => {
      const pageStep = window.innerHeight * 0.9;
      let targetY;
      switch (event.key) {
        case "ArrowDown": targetY = window.scrollY + 40; break;
        case "ArrowUp": targetY = window.scrollY - 40; break;
        case "PageDown": targetY = window.scrollY + pageStep; break;
        case "PageUp": targetY = window.scrollY - pageStep; break;
        case "Home": targetY = 0; break;
        case "End": targetY = document.documentElement.scrollHeight; break;
        default: return;
      }
      event.preventDefault();
      window.scrollTo(0, targetY);
    });
  } else if (customScrollbar) {
    customScrollbar.remove();
    customScrollbar = null;
    customScrollbarThumb = null;
    document.documentElement.classList.remove("custom-scrollbar-active");
  }

  scheduleCustomScrollbarUpdate();
};

window.addEventListener("scroll", scheduleCustomScrollbarUpdate, { passive: true });
window.addEventListener("resize", setCustomScrollbarEnabled);
customScrollbarQuery.addEventListener("change", setCustomScrollbarEnabled);
window.addEventListener("load", scheduleCustomScrollbarUpdate);
if ("ResizeObserver" in window) {
  const scrollbarResizeObserver = new ResizeObserver(scheduleCustomScrollbarUpdate);
  scrollbarResizeObserver.observe(document.documentElement);
  scrollbarResizeObserver.observe(document.body);
}
setCustomScrollbarEnabled();

/* --------------------------------------------------------------------------
   RETOUR EN HAUT ET PROGRESSION DE DÉFILEMENT
-------------------------------------------------------------------------- */
const backToTopButton = document.getElementById("back-to-top");
const backToTopRing = backToTopButton?.querySelector(".back-to-top-ring");
const backToTopRingLength = 2 * Math.PI * 21;

const updateBackToTop = () => {
  if (!backToTopButton || !backToTopRing) return;

  const documentHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );
  const scrollRange = Math.max(0, documentHeight - window.innerHeight);
  const progress = scrollRange > 0
    ? Math.min(1, Math.max(0, window.scrollY / scrollRange))
    : 0;

  backToTopRing.style.strokeDashoffset = String(backToTopRingLength * (1 - progress));
  const isVisible = window.scrollY > 0;
  backToTopButton.classList.toggle("is-visible", isVisible);
  backToTopButton.disabled = !isVisible;
  backToTopButton.setAttribute("aria-hidden", String(!isVisible));
};

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  window.addEventListener("resize", updateBackToTop);
  window.addEventListener("load", updateBackToTop);
  updateBackToTop();
}

/* --------------------------------------------------------------------------
   2. MENU MOBILE
-------------------------------------------------------------------------- */
const navBurger = document.getElementById("nav-burger");
const navLinks = document.getElementById("nav-links");
const pageToc = document.getElementById("page-toc");

if (pageToc) {
  const updatePageToc = () => {
    const isVisible = window.scrollY > 24;
    pageToc.classList.toggle("is-visible", isVisible);
    pageToc.setAttribute("aria-hidden", String(!isVisible));
  };

  updatePageToc();
  window.addEventListener("scroll", updatePageToc, { passive: true });

  const tocLinks = pageToc.querySelectorAll(".page-toc-link");
  const tocInner = pageToc.querySelector(".page-toc-inner");
  const tocSections = Array.from(tocLinks)
    .map((link) => document.querySelector(link.hash))
    .filter(Boolean);
  const tocIndicator = document.createElement("span");
  tocIndicator.className = "page-toc-indicator";
  tocIndicator.setAttribute("aria-hidden", "true");
  if (tocInner) tocInner.prepend(tocIndicator);

  const setActiveTocLink = (activeLink) => {
    tocLinks.forEach((link) => {
      const isCurrent = link === activeLink;
      link.classList.toggle("is-active", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });

    if (!tocInner || !activeLink) return;
    tocIndicator.style.setProperty("--toc-indicator-x", `${activeLink.offsetLeft}px`);
    tocIndicator.style.setProperty("--toc-indicator-width", `${activeLink.offsetWidth}px`);
    tocIndicator.classList.add("is-ready");
  };

  let tocScrollFrame = 0;
  let pendingTocLink = null;
  let tocScrollEndTimer = 0;
  const updateActiveTocLink = () => {
    tocScrollFrame = 0;
    if (pendingTocLink) return;

    const headerHeight = document.getElementById("site-header")?.offsetHeight || 0;
    const activationLine = window.scrollY + headerHeight + pageToc.offsetHeight + 24;
    let activeSection = null;

    tocSections.forEach((section) => {
      if (section.getBoundingClientRect().top + window.scrollY <= activationLine) {
        activeSection = section;
      }
    });

    if (activeSection) {
      const activeLink = Array.from(tocLinks).find((link) => link.hash === `#${activeSection.id}`);
      if (activeLink) setActiveTocLink(activeLink);
    }
  };
  const scheduleActiveTocUpdate = () => {
    if (tocScrollFrame) return;
    tocScrollFrame = window.requestAnimationFrame(updateActiveTocLink);
  };
  const finishTocScroll = () => {
    if (!pendingTocLink) return;
    pendingTocLink = null;
    window.clearTimeout(tocScrollEndTimer);
    scheduleActiveTocUpdate();
  };

  tocLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.hash);
      if (!target) return;

      event.preventDefault();
      pendingTocLink = link;
      window.clearTimeout(tocScrollEndTimer);
      setActiveTocLink(link);
      if (window.location.hash !== link.hash) {
        window.history.pushState(null, "", link.hash);
      }

      const headerHeight = document.getElementById("site-header")?.offsetHeight || 0;
      const targetY = Math.max(
        0,
        target.getBoundingClientRect().top + window.scrollY - headerHeight - pageToc.offsetHeight
      );
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: targetY, behavior: prefersReducedMotion ? "auto" : "smooth" });
      if (prefersReducedMotion || Math.abs(window.scrollY - targetY) < 2) {
        finishTocScroll();
      }
    });
  });
  window.addEventListener("scroll", () => {
    scheduleActiveTocUpdate();
    if (pendingTocLink) {
      window.clearTimeout(tocScrollEndTimer);
      tocScrollEndTimer = window.setTimeout(finishTocScroll, 180);
    }
  }, { passive: true });
  window.addEventListener("scrollend", finishTocScroll);
  window.addEventListener("resize", () => {
    const activeLink = pageToc.querySelector(".page-toc-link.is-active");
    if (activeLink) setActiveTocLink(activeLink);
    scheduleActiveTocUpdate();
  });
  scheduleActiveTocUpdate();
}

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
