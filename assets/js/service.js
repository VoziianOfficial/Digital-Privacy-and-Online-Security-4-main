



















(() => {
  "use strict";


  



  const state = {
    initialized: false,

    heroPlayed: false,

    reducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches,

    finePointer: window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches,

    resizeTimer: null
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


  const hasAOSAttribute = (
    element
  ) => {
    if (!element) {
      return false;
    }


    return element.hasAttribute(
      "data-aos"
    );
  };


  const clamp = (
    value,
    min,
    max
  ) => {
    return Math.min(
      Math.max(
        value,
        min
      ),
      max
    );
  };


  



  const showHeroImmediately = () => {
    $$(
      ".service-hero__title-line > span"
    ).forEach((line) => {
      line.style.transform =
        "translateY(0)";
    });


    [
      $(".service-hero__copy"),
      $(".service-hero__media"),
      $(".service-hero__media-small"),
      $(".service-hero__symbol")
    ]
      .filter(Boolean)
      .forEach((element) => {
        element.style.opacity = "1";
        element.style.visibility =
          "visible";
      });
  };


  



  const playHeroIntro = () => {
    if (state.heroPlayed) {
      return;
    }


    state.heroPlayed = true;


    const hero =
      $(".service-hero");


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
        ".service-hero__grid-line",
        hero
      );


    const titleLines =
      $$(
        ".service-hero__title-line > span",
        hero
      );


    const intro =
      $(".service-hero__intro", hero);


    const copy =
      $(".service-hero__copy", hero);


    const media =
      $(".service-hero__media", hero);


    const smallMedia =
      $(".service-hero__media-small", hero);


    const symbol =
      $(".service-hero__symbol", hero);


    const status =
      $(".service-hero__status", hero);


    const word =
      $(".service-hero__word", hero);


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


    

    if (intro) {
      timeline.set(
        intro,
        {
          autoAlpha: 1
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

          duration: 0.92,

          stagger: 0.09
        },
        0.28
      );
    }


    

    if (copy) {
      timeline.fromTo(
        copy,
        {
          x: 30,

          autoAlpha: 0
        },
        {
          x: 0,

          autoAlpha: 1,

          duration: 0.82
        },
        0.48
      );
    }


    

    if (media) {
      timeline.fromTo(
        media,
        {
          y: 45,

          scale: 0.94,

          autoAlpha: 0
        },
        {
          y: 0,

          scale: 1,

          autoAlpha: 1,

          duration: 1.05
        },
        0.5
      );
    }


    

    if (smallMedia) {
      timeline.fromTo(
        smallMedia,
        {
          x: 40,

          y: 25,

          scale: 0.9,

          autoAlpha: 0
        },
        {
          x: 0,

          y: 0,

          scale: 1,

          autoAlpha: 1,

          duration: 0.9
        },
        0.74
      );
    }


    

    if (symbol) {
      timeline.fromTo(
        symbol,
        {
          scale: 0.6,

          rotation: -14,

          autoAlpha: 0
        },
        {
          scale: 1,

          rotation: 0,

          autoAlpha: 1,

          duration: 0.9
        },
        0.76
      );
    }


    

    if (status) {
      timeline.fromTo(
        status,
        {
          x: -18,

          autoAlpha: 0
        },
        {
          x: 0,

          autoAlpha: 1,

          duration: 0.65
        },
        0.95
      );
    }


    

    if (word) {
      timeline.fromTo(
        word,
        {
          yPercent: 48,

          autoAlpha: 0
        },
        {
          yPercent: 0,

          autoAlpha: 1,

          duration: 1.15
        },
        0.5
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


  



  const initHeroSymbolMotion = () => {
    if (
      state.reducedMotion ||
      !hasGSAP()
    ) {
      return;
    }


    const symbol =
      $(".service-hero__symbol");


    const image =
      symbol
        ? $("img", symbol)
        : null;


    if (image) {
      window.gsap.to(
        image,
        {
          rotation: 360,

          duration: 30,

          repeat: -1,

          ease: "none",

          transformOrigin:
            "50% 50%"
        }
      );
    }


    if (symbol) {
      window.gsap.to(
        symbol,
        {
          y: -7,

          duration: 3.2,

          repeat: -1,

          yoyo: true,

          ease:
            "sine.inOut"
        }
      );
    }
  };


  



  const initHeroPointerMotion = () => {
    if (
      state.reducedMotion ||
      !state.finePointer ||
      !hasGSAP()
    ) {
      return;
    }


    const hero =
      $(".service-hero");


    const media =
      $(".service-hero__media");


    const smallMedia =
      $(".service-hero__media-small");


    const symbol =
      $(".service-hero__symbol");


    if (!hero) {
      return;
    }


    const mediaX =
      media
        ? window.gsap.quickTo(
            media,
            "x",
            {
              duration: 0.75,
              ease: "power3.out"
            }
          )
        : null;


    const mediaY =
      media
        ? window.gsap.quickTo(
            media,
            "y",
            {
              duration: 0.75,
              ease: "power3.out"
            }
          )
        : null;


    const smallX =
      smallMedia
        ? window.gsap.quickTo(
            smallMedia,
            "x",
            {
              duration: 0.6,
              ease: "power3.out"
            }
          )
        : null;


    const smallY =
      smallMedia
        ? window.gsap.quickTo(
            smallMedia,
            "y",
            {
              duration: 0.6,
              ease: "power3.out"
            }
          )
        : null;


    const symbolX =
      symbol
        ? window.gsap.quickTo(
            symbol,
            "x",
            {
              duration: 0.55,
              ease: "power3.out"
            }
          )
        : null;


    hero.addEventListener(
      "pointermove",
      (event) => {
        const rect =
          hero.getBoundingClientRect();


        const x =
          (
            event.clientX -
            rect.left
          ) /
            rect.width -
          0.5;


        const y =
          (
            event.clientY -
            rect.top
          ) /
            rect.height -
          0.5;


        mediaX?.(
          x * 15
        );


        mediaY?.(
          y * 10
        );


        smallX?.(
          x * -18
        );


        smallY?.(
          y * -13
        );


        symbolX?.(
          x * 12
        );
      }
    );


    hero.addEventListener(
      "pointerleave",
      () => {
        mediaX?.(0);
        mediaY?.(0);

        smallX?.(0);
        smallY?.(0);

        symbolX?.(0);
      }
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
      $(".service-hero");


    if (!hero) {
      return;
    }


    const media =
      $(".service-hero__media");


    const small =
      $(".service-hero__media-small");


    const word =
      $(".service-hero__word");


    const copy =
      $(".service-hero__copy");


    if (media) {
      window.gsap.to(
        media,
        {
          yPercent: 7,

          ease: "none",

          scrollTrigger: {
            trigger: hero,

            start: "top top",

            end: "bottom top",

            scrub: 0.9
          }
        }
      );
    }


    if (small) {
      window.gsap.to(
        small,
        {
          yPercent: -10,

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


    if (copy) {
      window.gsap.to(
        copy,
        {
          y: 50,

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


    if (word) {
      window.gsap.to(
        word,
        {
          xPercent: -2.2,

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
  };


  



  const initIntroMotion = () => {
    const section =
      $(".service-intro");


    if (
      !section ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const heading =
      $(".service-intro__heading", section);


    const main =
      $(".service-intro__image--main", section);


    const small =
      $(".service-intro__image--small", section);


    const connector =
      $(".service-intro__connector", section);


    const timeline =
      window.gsap.timeline({
        scrollTrigger: {
          trigger: section,

          start: "top 78%",

          once: true
        }
      });


    if (
      heading &&
      !hasAOSAttribute(
        heading
      )
    ) {
      timeline.from(
        heading,
        {
          x: -38,

          autoAlpha: 0,

          duration: 0.9,

          ease:
            "power3.out"
        }
      );
    }


    if (
      main &&
      !hasAOSAttribute(
        main
      )
    ) {
      timeline.from(
        main,
        {
          x: 50,

          autoAlpha: 0,

          duration: 0.95,

          ease:
            "power3.out"
        },
        "-=0.6"
      );
    }


    if (
      small &&
      !hasAOSAttribute(
        small
      )
    ) {
      timeline.from(
        small,
        {
          x: -42,

          y: 30,

          autoAlpha: 0,

          duration: 0.85,

          ease:
            "power3.out"
        },
        "-=0.62"
      );
    }


    if (connector) {
      timeline.from(
        connector,
        {
          scaleX: 0,

          transformOrigin:
            "left center",

          duration: 0.7,

          ease:
            "power3.inOut"
        },
        "-=0.38"
      );
    }


    



    if (main) {
      const image =
        $("img", main);


      if (image) {
        window.gsap.fromTo(
          image,
          {
            yPercent: -3
          },
          {
            yPercent: 3,

            ease: "none",

            scrollTrigger: {
              trigger: main,

              start:
                "top bottom",

              end:
                "bottom top",

              scrub: 0.8
            }
          }
        );
      }
    }
  };


  



  const initOverview = () => {
    const section =
      $(".service-overview");


    if (!section) {
      return;
    }


    const rows =
      $$(
        ".service-overview-item",
        section
      );


    if (!rows.length) {
      return;
    }


    



    const images =
      $$(
        ".service-overview__image",
        section
      );


    const activate = (
      selected
    ) => {
      const selectedIndex =
        rows.indexOf(selected);

      rows.forEach((row) => {
        row.classList.toggle(
          "is-active",
          row === selected
        );
      });

      images.forEach((image, index) => {
        image.classList.toggle(
          "is-active",
          index === selectedIndex
        );
      });
    };


    rows.forEach((row) => {
      row.addEventListener(
        "mouseenter",
        () => {
          activate(row);
        }
      );


      row.addEventListener(
        "focusin",
        () => {
          activate(row);
        }
      );


      row.addEventListener(
        "click",
        () => {
          activate(row);
        }
      );
    });


    activate(rows[0]);


    



    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const media =
      $(".service-overview__media", section);


    if (
      media &&
      !hasAOSAttribute(
        media
      )
    ) {
      window.gsap.from(
        media,
        {
          x: -35,

          autoAlpha: 0,

          duration: 0.85,

          ease:
            "power3.out",

          scrollTrigger: {
            trigger: media,

            start:
              "top 84%",

            once: true
          }
        }
      );
    }


    const cleanRows =
      rows.filter(
        (row) =>
          !hasAOSAttribute(
            row
          )
      );


    if (cleanRows.length) {
      window.ScrollTrigger.batch(
        cleanRows,
        {
          start:
            "top 89%",

          once: true,


          onEnter(batch) {
            window.gsap.fromTo(
              batch,
              {
                x: 30,

                autoAlpha: 0
              },
              {
                x: 0,

                autoAlpha: 1,

                duration: 0.72,

                stagger: 0.075,

                ease:
                  "power3.out"
              }
            );
          }
        }
      );
    }
  };


  



  const initFocusCards = () => {
    const section =
      $(".service-focus");


    if (
      !section ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const head =
      $(".service-focus__head", section);


    const cards =
      $$(
        ".service-focus-card",
        section
      );


    if (
      head &&
      !hasAOSAttribute(
        head
      )
    ) {
      window.gsap.from(
        head,
        {
          y: 38,

          autoAlpha: 0,

          duration: 0.88,

          ease:
            "power3.out",

          scrollTrigger: {
            trigger: head,

            start:
              "top 85%",

            once: true
          }
        }
      );
    }


    const cleanCards =
      cards.filter(
        (card) =>
          !hasAOSAttribute(
            card
          )
      );


    if (cleanCards.length) {
      window.ScrollTrigger.batch(
        cleanCards,
        {
          start:
            "top 90%",

          once: true,


          onEnter(batch) {
            window.gsap.fromTo(
              batch,
              {
                y: 42,

                autoAlpha: 0
              },
              {
                y: 0,

                autoAlpha: 1,

                duration: 0.78,

                stagger: 0.09,

                ease:
                  "power3.out"
              }
            );
          }
        }
      );
    }
  };


  



  const initDiagram = () => {
    const section =
      $(".service-scheme");


    if (
      !section ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const head =
      $(".service-scheme__head", section);


    const media =
      $$(
        ".service-diagram__media",
        section
      );


    const connectors =
      $$(
        ".service-diagram__connector",
        section
      );


    if (
      head &&
      !hasAOSAttribute(
        head
      )
    ) {
      window.gsap.from(
        head,
        {
          y: 36,

          autoAlpha: 0,

          duration: 0.85,

          ease:
            "power3.out",

          scrollTrigger: {
            trigger: head,

            start:
              "top 84%",

            once: true
          }
        }
      );
    }


    if (media.length) {
      window.gsap.from(
        media,
        {
          y: 36,

          autoAlpha: 0,

          duration: 0.85,

          stagger: 0.09,

          ease:
            "power3.out",

          scrollTrigger: {
            trigger:
              ".service-diagram",

            start:
              "top 82%",

            once: true
          }
        }
      );
    }


    if (connectors.length) {
      window.gsap.from(
        connectors,
        {
          clipPath:
            "inset(0 100% 0 0)",

          duration: 0.7,

          stagger: 0.1,

          ease:
            "power3.inOut",

          scrollTrigger: {
            trigger:
              ".service-diagram",

            start:
              "top 71%",

            once: true
          }
        }
      );
    }
  };


  



  const initFlowInteraction = () => {
    const board =
      $(".service-flow__board");


    if (!board) {
      return;
    }


    const nodes =
      $$(
        ".service-flow-node",
        board
      );


    if (!nodes.length) {
      return;
    }


    const activate = (
      selected
    ) => {
      nodes.forEach((node) => {
        node.classList.toggle(
          "is-active",
          node === selected
        );
      });
    };


    activate(nodes[0]);


    nodes.forEach((node) => {
      node.addEventListener(
        "mouseenter",
        () => {
          activate(node);
        }
      );


      node.addEventListener(
        "focusin",
        () => {
          activate(node);
        }
      );


      node.addEventListener(
        "click",
        () => {
          activate(node);
        }
      );
    });
  };


  



  const initFlowReveal = () => {
    const section =
      $(".service-flow");


    if (
      !section ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const head =
      $(".service-flow__head", section);


    const board =
      $(".service-flow__board", section);


    const bg =
      $(".service-flow__bg", section);


    const line =
      $(".service-flow__line", section);


    const nodes =
      $$(
        ".service-flow-node",
        section
      );


    if (
      head &&
      !hasAOSAttribute(
        head
      )
    ) {
      window.gsap.from(
        head,
        {
          y: 34,

          autoAlpha: 0,

          duration: 0.85,

          ease:
            "power3.out",

          scrollTrigger: {
            trigger: head,

            start:
              "top 85%",

            once: true
          }
        }
      );
    }


    if (board) {
      const timeline =
        window.gsap.timeline({
          scrollTrigger: {
            trigger: board,

            start:
              "top 83%",

            once: true
          }
        });


      timeline.from(
        board,
        {
          y: 30,

          autoAlpha: 0,

          duration: 0.75,

          ease:
            "power3.out"
        }
      );


      if (line) {
        timeline.from(
          line,
          {
            scaleX: 0,

            transformOrigin:
              "left center",

            duration: 0.85,

            ease:
              "power3.inOut"
          },
          "-=0.4"
        );
      }


      if (nodes.length) {
        timeline.from(
          nodes,
          {
            y: 24,

            autoAlpha: 0,

            duration: 0.65,

            stagger: 0.1,

            ease:
              "power3.out"
          },
          "-=0.52"
        );
      }
    }


    if (
      board &&
      bg
    ) {
      window.gsap.fromTo(
        bg,
        {
          yPercent: -6
        },
        {
          yPercent: 6,

          ease: "none",

          scrollTrigger: {
            trigger: board,

            start:
              "top bottom",

            end:
              "bottom top",

            scrub: 0.85
          }
        }
      );
    }
  };


  



  const initParallax = () => {
    const section =
      $(".service-parallax");


    const image =
      $(".service-parallax__media img");


    if (
      !section ||
      !image ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    window.gsap.fromTo(
      image,
      {
        yPercent: -7
      },
      {
        yPercent: 7,

        ease: "none",

        scrollTrigger: {
          trigger: section,

          start:
            "top bottom",

          end:
            "bottom top",

          scrub: 0.85
        }
      }
    );


    const title =
      $(".service-parallax__title");


    const side =
      $(".service-parallax__side");


    if (title) {
      window.gsap.from(
        title,
        {
          y: 50,

          autoAlpha: 0,

          duration: 0.95,

          ease:
            "power3.out",

          scrollTrigger: {
            trigger: title,

            start:
              "top 85%",

            once: true
          }
        }
      );
    }


    if (side) {
      window.gsap.from(
        side,
        {
          y: 32,

          autoAlpha: 0,

          duration: 0.8,

          ease:
            "power3.out",

          scrollTrigger: {
            trigger: side,

            start:
              "top 87%",

            once: true
          }
        }
      );
    }
  };


  









  const initResourceRows = () => {
    const rows =
      $$(
        ".service-resource-row"
      );


    if (!rows.length) {
      return;
    }


    if (
      !state.finePointer ||
      state.reducedMotion
    ) {
      return;
    }


    rows.forEach((row) => {
      const image =
        $(
          ".service-resource-row__image",
          row
        );


      if (!image) {
        return;
      }


      let xTo = null;
      let yTo = null;


      if (hasGSAP()) {
        xTo =
          window.gsap.quickTo(
            image,
            "left",
            {
              duration: 0.36,

              ease:
                "power3.out"
            }
          );


        yTo =
          window.gsap.quickTo(
            image,
            "top",
            {
              duration: 0.36,

              ease:
                "power3.out"
            }
          );
      }


      const positionImage = (
        event,
        immediate = false
      ) => {
        const rect =
          row.getBoundingClientRect();


        const imageRect =
          image.getBoundingClientRect();


        const halfWidth =
          Math.max(
            85,
            imageRect.width / 2
          );


        const minimumX =
          Math.min(
            rect.width * 0.42,
            rect.width -
              halfWidth
          );


        const maximumX =
          Math.max(
            minimumX,
            rect.width -
              halfWidth -
              10
          );


        const localX =
          clamp(
            event.clientX -
              rect.left,

            minimumX,

            maximumX
          );


        const localY =
          clamp(
            event.clientY -
              rect.top,

            10,

            rect.height - 10
          );


        if (
          immediate ||
          !xTo ||
          !yTo
        ) {
          image.style.left =
            `${localX}px`;

          image.style.top =
            `${localY}px`;

          return;
        }


        xTo(localX);
        yTo(localY);
      };


      const activate = (
        event
      ) => {
        rows.forEach(
          (otherRow) => {
            if (
              otherRow !== row
            ) {
              otherRow.classList.remove(
                "is-active"
              );
            }
          }
        );


        row.classList.add(
          "is-active"
        );


        if (event) {
          positionImage(
            event,
            true
          );
        }
      };


      const deactivate = () => {
        row.classList.remove(
          "is-active"
        );
      };


      row.addEventListener(
        "pointerenter",
        (event) => {
          activate(event);
        }
      );


      row.addEventListener(
        "pointermove",
        (event) => {
          if (
            !row.classList.contains(
              "is-active"
            )
          ) {
            activate(event);
          }


          positionImage(
            event
          );
        }
      );


      row.addEventListener(
        "pointerleave",
        deactivate
      );


      row.addEventListener(
        "focusin",
        () => {
          row.classList.add(
            "is-active"
          );


          const rect =
            row.getBoundingClientRect();


          positionImage(
            {
              clientX:
                rect.left +
                rect.width * 0.68,

              clientY:
                rect.top +
                rect.height * 0.5
            },
            true
          );
        }
      );


      row.addEventListener(
        "focusout",
        (event) => {
          if (
            row.contains(
              event.relatedTarget
            )
          ) {
            return;
          }


          deactivate();
        }
      );
    });
  };


  



  const initResourcesReveal = () => {
    const section =
      $(".service-resources");


    if (
      !section ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const head =
      $(".service-resources__head", section);


    const rows =
      $$(
        ".service-resource-row",
        section
      );


    if (
      head &&
      !hasAOSAttribute(
        head
      )
    ) {
      window.gsap.from(
        head,
        {
          y: 35,

          autoAlpha: 0,

          duration: 0.85,

          ease:
            "power3.out",

          scrollTrigger: {
            trigger: head,

            start:
              "top 85%",

            once: true
          }
        }
      );
    }


    if (rows.length) {
      window.ScrollTrigger.batch(
        rows,
        {
          start:
            "top 90%",

          once: true,


          onEnter(batch) {
            window.gsap.fromTo(
              batch,
              {
                y: 27,

                autoAlpha: 0
              },
              {
                y: 0,

                autoAlpha: 1,

                duration: 0.66,

                stagger: 0.075,

                ease:
                  "power3.out"
              }
            );
          }
        }
      );
    }
  };


  





  const initFAQReveal = () => {
    const section =
      $(".service-faq");


    if (
      !section ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const head =
      $(".service-faq__head", section);


    const columns =
      $$(
        ".service-faq__column",
        section
      );


    if (
      head &&
      !hasAOSAttribute(
        head
      )
    ) {
      window.gsap.from(
        head,
        {
          y: 34,

          autoAlpha: 0,

          duration: 0.82,

          ease:
            "power3.out",

          scrollTrigger: {
            trigger: head,

            start:
              "top 86%",

            once: true
          }
        }
      );
    }


    if (columns.length) {
      window.gsap.from(
        columns,
        {
          y: 30,

          autoAlpha: 0,

          duration: 0.82,

          stagger: 0.1,

          ease:
            "power3.out",

          scrollTrigger: {
            trigger:
              ".service-faq__columns",

            start:
              "top 87%",

            once: true
          }
        }
      );
    }
  };


  



  const initContactReveal = () => {
    const section =
      $(".service-contact");


    if (
      !section ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const intro =
      $(".service-contact__intro", section);


    const form =
      $(".service-contact__form", section);


    if (
      intro &&
      !hasAOSAttribute(
        intro
      )
    ) {
      window.gsap.from(
        intro,
        {
          x: -38,

          autoAlpha: 0,

          duration: 0.88,

          ease:
            "power3.out",

          scrollTrigger: {
            trigger: intro,

            start:
              "top 85%",

            once: true
          }
        }
      );
    }


    if (
      form &&
      !hasAOSAttribute(
        form
      )
    ) {
      window.gsap.from(
        form,
        {
          x: 38,

          autoAlpha: 0,

          duration: 0.88,

          ease:
            "power3.out",

          scrollTrigger: {
            trigger: form,

            start:
              "top 85%",

            once: true
          }
        }
      );
    }
  };


  



  const initEndReveal = () => {
    const section =
      $(".service-end");


    if (
      !section ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const title =
      $(".service-end__title", section);


    const mark =
      $(".service-end__mark", section);


    const timeline =
      window.gsap.timeline({
        scrollTrigger: {
          trigger: section,

          start:
            "top 85%",

          once: true
        }
      });


    if (title) {
      timeline.from(
        title,
        {
          x: -35,

          autoAlpha: 0,

          duration: 0.85,

          ease:
            "power3.out"
        }
      );
    }


    if (mark) {
      timeline.from(
        mark,
        {
          scale: 0.72,

          rotation: -18,

          autoAlpha: 0,

          duration: 0.85,

          ease:
            "power3.out"
        },
        "-=0.55"
      );


      window.gsap.to(
        mark,
        {
          rotation: 360,

          duration: 28,

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


    initHeroSymbolMotion();

    initHeroPointerMotion();

    initHeroScrollMotion();

    initIntroMotion();

    initOverview();

    initFocusCards();

    initDiagram();

    initFlowReveal();

    initParallax();

    initResourcesReveal();

    initFAQReveal();

    initContactReveal();

    initEndReveal();
  };


  



  const init = () => {
    if (state.initialized) {
      return;
    }


    const page =
      $(".service-page");


    if (!page) {
      return;
    }


    state.initialized =
      true;


    




    initFlowInteraction();

    initResourceRows();


    



    initMotion();


    



    waitForLoader();


    



  };


  



  window.PrivoraService = {
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
