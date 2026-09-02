





















(() => {
  "use strict";


  



  const state = {
    initialized: false,

    heroPlayed: false,

    reducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches,

    resizeTimer: null,

    sectionObserver: null
  };


  



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

        window.ScrollTrigger.config({
          ignoreMobileResize: true
        });
      } catch (_) {
        
      }
    }


    return true;
  };


  const requestGlobalRefresh = (
    delay
  ) => {
    if (
      window.PrivoraRefresh &&
      typeof window.PrivoraRefresh
        .request ===
        "function"
    ) {
      window.PrivoraRefresh
        .request(delay);
    }
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


    



    activateById(
      sections[0].id
    );


    




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


  



  const refresh = () => {
    requestGlobalRefresh();
  };


  


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


    



    initSidebarNavigation();


    



    initMotion();


    



    waitForLoader();


    



  };


  



  window.PrivoraLegal = {
    init,

    refresh,

    state
  };


  



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
