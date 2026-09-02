/* =========================================================
   PRIVORA — LEGAL JAVASCRIPT
   Digital Privacy & Online Security

   Used by:
   - privacy.html
   - terms.html
   - cookies.html

   Requires:
   - GSAP
   - ScrollTrigger
   - global.js

   Responsibilities:
   - legal hero reveal
   - legal document reveal
   - sidebar navigation spy
   - active legal section
   - contact strip reveal
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     01. STATE
     ======================================================= */

  const state = {
    initialized: false,

    heroPlayed: false,

    reducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches,

    resizeTimer: null,

    sectionObserver: null
  };


  /* =======================================================
     02. HELPERS
     ======================================================= */

  const $ = (
    selector,
    scope = document
  ) => scope.querySelector(selector);


  const $$ = (
    selector,
    scope = document
  ) => Array.from(
    scope.querySelectorAll(selector)
  );


  const hasGSAP = () =>
    typeof window.gsap !== "undefined";


  const hasScrollTrigger = () =>
    typeof window.ScrollTrigger !== "undefined";


  const registerGSAP = () => {
    if (!hasGSAP()) {
      return false;
    }


    if (hasScrollTrigger()) {
      try {
        window.gsap.registerPlugin(
          window.ScrollTrigger
        );
      } catch (_) {
        /* no-op */
      }
    }


    return true;
  };


  const hasAOS = (
    element
  ) => {
    return Boolean(
      element &&
      element.hasAttribute(
        "data-aos"
      )
    );
  };


  /* =======================================================
     03. HERO FALLBACK
     ======================================================= */

  const showHeroImmediately = () => {
    $$(
      ".legal-hero__title-line > span"
    ).forEach((line) => {
      line.style.transform =
        "translateY(0)";
    });


    const meta =
      $(".legal-hero__meta");


    if (meta) {
      meta.style.opacity = "1";
      meta.style.visibility =
        "visible";
    }
  };


  /* =======================================================
     04. HERO INTRO
     ======================================================= */

  const playHeroIntro = () => {
    if (state.heroPlayed) {
      return;
    }


    state.heroPlayed = true;


    const hero =
      $(".legal-hero");


    if (!hero) {
      return;
    }


    if (
      state.reducedMotion ||
      !hasGSAP()
    ) {
      showHeroImmediately();
      return;
    }


    const gridLines =
      $$(
        ".legal-hero__grid-line",
        hero
      );


    const label =
      $(".legal-hero__label", hero);


    const titleLines =
      $$(
        ".legal-hero__title-line > span",
        hero
      );


    const meta =
      $(".legal-hero__meta", hero);


    const giantWord =
      $(".legal-hero__word", hero);


    const timeline =
      window.gsap.timeline({
        defaults: {
          ease: "power4.out"
        }
      });


    /* vertical construction lines */

    if (gridLines.length) {
      timeline.fromTo(
        gridLines,
        {
          scaleY: 0,

          transformOrigin:
            "top center"
        },
        {
          scaleY: 1,

          duration: 1,

          stagger: 0.055
        },
        0
      );
    }


    /* small label */

    if (label) {
      timeline.fromTo(
        label,
        {
          y: 16,

          autoAlpha: 0
        },
        {
          y: 0,

          autoAlpha: 1,

          duration: 0.6
        },
        0.22
      );
    }


    /* heading lines */

    if (titleLines.length) {
      timeline.fromTo(
        titleLines,
        {
          yPercent: 110
        },
        {
          yPercent: 0,

          duration: 0.95,

          stagger: 0.09
        },
        0.28
      );
    }


    /* right meta */

    if (meta) {
      timeline.fromTo(
        meta,
        {
          x: 28,

          autoAlpha: 0
        },
        {
          x: 0,

          autoAlpha: 1,

          duration: 0.82
        },
        0.52
      );
    }


    /* background giant word */

    if (giantWord) {
      timeline.fromTo(
        giantWord,
        {
          yPercent: 42,

          autoAlpha: 0
        },
        {
          yPercent: 0,

          autoAlpha: 1,

          duration: 1.15
        },
        0.42
      );
    }
  };


  /* =======================================================
     05. WAIT FOR GLOBAL LOADER
     ======================================================= */

  const waitForLoader = () => {
    const loader =
      $(".page-loader");


    if (
      !loader ||
      loader.classList.contains(
        "is-hidden"
      )
    ) {
      window.requestAnimationFrame(
        playHeroIntro
      );

      return;
    }


    const observer =
      new MutationObserver(() => {
        if (
          loader.classList.contains(
            "is-hidden"
          )
        ) {
          observer.disconnect();

          playHeroIntro();
        }
      });


    observer.observe(
      loader,
      {
        attributes: true,

        attributeFilter: [
          "class"
        ]
      }
    );


    window.addEventListener(
      "privora:loader-hidden",
      () => {
        observer.disconnect();

        playHeroIntro();
      },
      {
        once: true
      }
    );


    /*
     Safety fallback.
     Hero should never stay hidden.
    */

    window.setTimeout(
      () => {
        if (!state.heroPlayed) {
          observer.disconnect();

          playHeroIntro();
        }
      },
      2500
    );
  };


  /* =======================================================
     06. HERO SCROLL MOTION
     ======================================================= */

  const initHeroScrollMotion = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const hero =
      $(".legal-hero");


    const word =
      $(".legal-hero__word");


    const meta =
      $(".legal-hero__meta");


    if (!hero) {
      return;
    }


    if (word) {
      window.gsap.to(
        word,
        {
          xPercent: -2.4,

          yPercent: 7,

          ease: "none",

          scrollTrigger: {
            trigger: hero,

            start: "top top",

            end: "bottom top",

            scrub: 0.85
          }
        }
      );
    }


    if (meta) {
      window.gsap.to(
        meta,
        {
          y: 34,

          ease: "none",

          scrollTrigger: {
            trigger: hero,

            start: "top top",

            end: "bottom top",

            scrub: 1
          }
        }
      );
    }
  };


  /* =======================================================
     07. LEGAL DOCUMENT INTRO
     ======================================================= */

  const initDocumentIntro = () => {
    const element =
      $(".legal-document__intro");


    if (
      !element ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger() ||
      hasAOS(element)
    ) {
      return;
    }


    window.gsap.from(
      element,
      {
        y: 32,

        autoAlpha: 0,

        duration: 0.85,

        ease: "power3.out",

        scrollTrigger: {
          trigger: element,

          start: "top 87%",

          once: true
        }
      }
    );
  };


  /* =======================================================
     08. LEGAL SECTIONS REVEAL
     ======================================================= */

  const initSectionReveal = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const sections =
      $$(".legal-section").filter(
        (section) =>
          !hasAOS(section)
      );


    if (!sections.length) {
      return;
    }


    window.ScrollTrigger.batch(
      sections,
      {
        start: "top 90%",

        once: true,


        onEnter(batch) {
          window.gsap.fromTo(
            batch,
            {
              y: 30,

              autoAlpha: 0
            },
            {
              y: 0,

              autoAlpha: 1,

              duration: 0.72,

              stagger: 0.07,

              ease: "power3.out"
            }
          );
        }
      }
    );
  };


  /* =======================================================
     09. SIDEBAR REVEAL
     ======================================================= */

  const initSidebarReveal = () => {
    const sidebar =
      $(".legal-sidebar");


    if (
      !sidebar ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger() ||
      hasAOS(sidebar)
    ) {
      return;
    }


    window.gsap.from(
      sidebar,
      {
        x: -28,

        autoAlpha: 0,

        duration: 0.8,

        ease: "power3.out",

        scrollTrigger: {
          trigger: sidebar,

          start: "top 88%",

          once: true
        }
      }
    );
  };


  /* =======================================================
     10. SIDEBAR NAVIGATION
     -------------------------------------------------------
     HTML expected:

     <a
       class="legal-sidebar__link"
       href="#information"
     >

     <section
       id="information"
       class="legal-section"
     >
     ======================================================= */

  const initSidebarNavigation = () => {
    const links =
      $$(".legal-sidebar__link");


    const sections =
      $$(".legal-section[id]");


    if (
      !links.length ||
      !sections.length
    ) {
      return;
    }


    const clearActive = () => {
      links.forEach((link) => {
        link.classList.remove(
          "is-active"
        );


        link.removeAttribute(
          "aria-current"
        );
      });
    };


    const activateById = (
      id
    ) => {
      if (!id) {
        return;
      }


      clearActive();


      links.forEach((link) => {
        const href =
          link.getAttribute(
            "href"
          );


        if (
          href === `#${id}`
        ) {
          link.classList.add(
            "is-active"
          );


          link.setAttribute(
            "aria-current",
            "location"
          );
        }
      });
    };


    /*
     First section active by default.
    */

    activateById(
      sections[0].id
    );


    /*
     Click activates instantly.
     Actual scrolling is handled by global.js.
    */

    links.forEach((link) => {
      link.addEventListener(
        "click",
        () => {
          const href =
            link.getAttribute(
              "href"
            );


          if (
            !href ||
            !href.startsWith("#")
          ) {
            return;
          }


          activateById(
            href.slice(1)
          );
        }
      );
    });


    /*
     Scroll spy.

     rootMargin is intentionally broad enough
     that large legal sections do not flicker
     between active states.
    */

    if (
      typeof IntersectionObserver ===
        "undefined"
    ) {
      return;
    }


    state.sectionObserver =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) => {
                  const aTop =
                    Math.abs(
                      a.boundingClientRect.top
                    );


                  const bTop =
                    Math.abs(
                      b.boundingClientRect.top
                    );


                  return aTop - bTop;
                }
              )[0];


          if (!visible) {
            return;
          }


          activateById(
            visible.target.id
          );
        },
        {
          threshold: [
            0.05,
            0.15,
            0.3
          ],

          rootMargin:
            "-18% 0px -62% 0px"
        }
      );


    sections.forEach((section) => {
      state.sectionObserver.observe(
        section
      );
    });


    /*
     Initial hash.
    */

    if (
      window.location.hash
    ) {
      const id =
        window.location.hash
          .replace(/^#/, "");


      const matching =
        document.getElementById(
          id
        );


      if (
        matching &&
        matching.classList.contains(
          "legal-section"
        )
      ) {
        activateById(id);
      }
    }
  };


  /* =======================================================
     11. NOTE / TABLE REVEALS
     ======================================================= */

  const initDetailReveals = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const elements =
      $$(
        [
          ".legal-note",
          ".legal-table-wrap"
        ].join(",")
      ).filter(
        (element) =>
          !hasAOS(element)
      );


    if (!elements.length) {
      return;
    }


    elements.forEach(
      (element) => {
        window.gsap.from(
          element,
          {
            y: 20,

            autoAlpha: 0,

            duration: 0.7,

            ease: "power3.out",

            scrollTrigger: {
              trigger: element,

              start: "top 91%",

              once: true
            }
          }
        );
      }
    );
  };


  /* =======================================================
     12. LEGAL CONTACT STRIP
     ======================================================= */

  const initContactReveal = () => {
    const section =
      $(".legal-contact");


    if (
      !section ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const content =
      $(".legal-contact__content", section);


    const mark =
      $(".legal-contact__mark", section);


    const timeline =
      window.gsap.timeline({
        scrollTrigger: {
          trigger: section,

          start: "top 86%",

          once: true
        }
      });


    if (content) {
      timeline.from(
        content,
        {
          x: -34,

          autoAlpha: 0,

          duration: 0.85,

          ease: "power3.out"
        }
      );
    }


    if (mark) {
      timeline.from(
        mark,
        {
          scale: 0.7,

          rotation: -18,

          autoAlpha: 0,

          duration: 0.85,

          ease: "power3.out"
        },
        "-=0.55"
      );


      /*
       Slow reference-style brand movement.
      */

      window.gsap.to(
        mark,
        {
          rotation: 360,

          duration: 30,

          repeat: -1,

          ease: "none"
        }
      );
    }
  };


  /* =======================================================
     13. REFRESH
     ======================================================= */

  const refresh = () => {
    if (
      !hasScrollTrigger()
    ) {
      return;
    }


    window.requestAnimationFrame(
      () => {
        try {
          window.ScrollTrigger.refresh();
        } catch (_) {
          /* no-op */
        }
      }
    );
  };


  /* =======================================================
     14. IMAGES
     ======================================================= */

  const initImageRefresh = () => {
    $$(
      ".legal-page img"
    ).forEach((image) => {
      if (image.complete) {
        return;
      }


      image.addEventListener(
        "load",
        refresh,
        {
          once: true
        }
      );


      image.addEventListener(
        "error",
        refresh,
        {
          once: true
        }
      );
    });
  };


  /* =======================================================
     15. RESIZE
     ======================================================= */

  const initResize = () => {
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(
          state.resizeTimer
        );


        state.resizeTimer =
          window.setTimeout(
            refresh,
            180
          );
      },
      {
        passive: true
      }
    );
  };


  /* =======================================================
     16. MOTION INIT
     ======================================================= */

  const initMotion = () => {
    if (!registerGSAP()) {
      showHeroImmediately();
      return;
    }


    if (state.reducedMotion) {
      showHeroImmediately();
      return;
    }


    initHeroScrollMotion();

    initSidebarReveal();

    initDocumentIntro();

    initSectionReveal();

    initDetailReveals();

    initContactReveal();
  };


  /* =======================================================
     17. INIT
     ======================================================= */

  const init = () => {
    if (state.initialized) {
      return;
    }


    const page =
      $(".legal-page");


    if (!page) {
      return;
    }


    state.initialized =
      true;


    /*
     Navigation spy does not depend on GSAP.
    */

    initSidebarNavigation();


    /*
     Animation.
    */

    initMotion();


    /*
     Hero waits for global loader.
    */

    waitForLoader();


    /*
     Lifecycle.
    */

    initImageRefresh();

    initResize();


    window.addEventListener(
      "load",
      refresh,
      {
        once: true
      }
    );


    window.addEventListener(
      "pageshow",
      (event) => {
        if (event.persisted) {
          window.setTimeout(
            refresh,
            60
          );
        }
      }
    );
  };


  /* =======================================================
     18. PUBLIC API
     ======================================================= */

  window.PrivoraLegal = {
    init,

    refresh,

    state
  };


  /* =======================================================
     19. START
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }

})();
