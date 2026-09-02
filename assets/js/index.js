














(() => {
  "use strict";

  document.documentElement.classList.add("js");


  



  const state = {
    initialized: false,
    heroPlayed: false,
    reducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches,
    swipers: [],
    ribbonLoops: [],
    resizeTimer: null
  };


  



  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));


  const hasGSAP = () =>
    typeof window.gsap !== "undefined";


  const hasScrollTrigger = () =>
    typeof window.ScrollTrigger !== "undefined";


  const hasSwiper = () =>
    typeof window.Swiper !== "undefined";


  const isDesktopHover = () =>
    window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 721px)"
    ).matches;


  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  const registerGSAP = () => {
    if (!hasGSAP()) return false;

    if (hasScrollTrigger()) {
      window.gsap.registerPlugin(
        window.ScrollTrigger
      );

      window.ScrollTrigger.config({
        ignoreMobileResize: true
      });
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


  const stripCloneAttributes = (element) => {
    if (!element) return;

    element.removeAttribute("id");

    [
      "data-aos",
      "data-aos-delay",
      "data-aos-duration",
      "data-aos-anchor"
    ].forEach((attribute) => {
      element.removeAttribute(attribute);
    });


    $$("[id]", element).forEach((child) => {
      child.removeAttribute("id");
    });


    $$("[data-aos]", element).forEach((child) => {
      [
        "data-aos",
        "data-aos-delay",
        "data-aos-duration",
        "data-aos-anchor"
      ].forEach((attribute) => {
        child.removeAttribute(attribute);
      });
    });
  };


  



  const showHeroImmediately = () => {
    const copy = $(".home-hero__copy");
    const object = $(".home-hero__object");
    const cta = $(".home-hero__cta");

    const lines = $$(
      ".home-hero__title-line span"
    );


    lines.forEach((line) => {
      line.style.transform =
        "translateY(0)";
    });


    [
      copy,
      object,
      cta
    ].filter(Boolean).forEach((element) => {
      element.style.opacity = "1";
      element.style.visibility = "visible";
    });
  };


  



  const playHeroIntro = () => {
    if (state.heroPlayed) return;

    state.heroPlayed = true;


    const hero = $(".home-hero");

    if (!hero) return;


    if (
      state.reducedMotion ||
      !hasGSAP()
    ) {
      showHeroImmediately();
      return;
    }


    const copy =
      $(".home-hero__copy");

    const lines =
      $$(".home-hero__title-line span");

    const object =
      $(".home-hero__object");

    const cta =
      $(".home-hero__cta");

    const microRing =
      $(".home-hero__micro-ring");

    const word =
      $(".home-hero__word");

    const gridLines =
      $$(".home-hero__grid-line");


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
          transformOrigin: "top center"
        },
        {
          scaleY: 1,
          duration: 1.05,
          stagger: 0.06
        },
        0
      );
    }


    

    if (object) {
      timeline.fromTo(
        object,
        {
          autoAlpha: 0,
          scale: 0.7,
          rotation: -18,
          y: -22
        },
        {
          autoAlpha: 1,
          scale: 1,
          rotation: 0,
          y: 0,
          duration: 1.25
        },
        0.18
      );
    }


    

    if (copy) {
      timeline.set(
        copy,
        {
          autoAlpha: 1
        },
        0.28
      );
    }


    if (lines.length) {
      timeline.fromTo(
        lines,
        {
          yPercent: 110
        },
        {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.1
        },
        0.38
      );
    }


    

    if (cta) {
      timeline.fromTo(
        cta,
        {
          autoAlpha: 0,
          scale: 0.72,
          rotation: 12
        },
        {
          autoAlpha: 1,
          scale: 1,
          rotation: 0,
          duration: 0.85
        },
        0.72
      );
    }


    

    if (microRing) {
      timeline.fromTo(
        microRing,
        {
          autoAlpha: 0,
          scale: 0.3
        },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.65
        },
        0.86
      );
    }


    

    if (word) {
      timeline.fromTo(
        word,
        {
          yPercent: 46,
          autoAlpha: 0
        },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1.2
        },
        0.46
      );
    }
  };


  



  const waitForLoader = () => {
    const loader =
      $(".page-loader");


    if (
      !loader ||
      loader.classList.contains("is-hidden")
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
        attributeFilter: ["class"]
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


    




    window.setTimeout(() => {
      if (!state.heroPlayed) {
        observer.disconnect();

        playHeroIntro();
      }
    }, 2500);
  };


  



  const initHeroObjectMotion = () => {
    if (
      state.reducedMotion ||
      !hasGSAP()
    ) {
      return;
    }


    const object =
      $(".home-hero__object");

    if (!object) return;


    const image =
      $("img", object);


    






    if (image) {
      window.gsap.to(
        image,
        {
          rotation: 360,

          duration: 32,

          repeat: -1,

          ease: "none",

          transformOrigin:
            "50% 50%"
        }
      );
    }


    const outerRing =
      $(".home-hero__object-ring", object);

    const innerRing =
      $(
        ".home-hero__object-ring--small",
        object
      );


    if (outerRing) {
      window.gsap.to(
        outerRing,
        {
          rotation: -360,

          duration: 43,

          repeat: -1,

          ease: "none"
        }
      );
    }


    if (innerRing) {
      window.gsap.to(
        innerRing,
        {
          rotation: 360,

          duration: 27,

          repeat: -1,

          ease: "none"
        }
      );
    }
  };


  



  const initHeroPointer = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !isDesktopHover()
    ) {
      return;
    }


    const hero =
      $(".home-hero");

    const object =
      $(".home-hero__object");

    const ring =
      $(".home-hero__micro-ring");


    if (!hero || !object) return;


    const objectX =
      window.gsap.quickTo(
        object,
        "x",
        {
          duration: 0.85,
          ease: "power3.out"
        }
      );


    const objectY =
      window.gsap.quickTo(
        object,
        "y",
        {
          duration: 0.85,
          ease: "power3.out"
        }
      );


    let ringX = null;
    let ringY = null;


    if (ring) {
      ringX =
        window.gsap.quickTo(
          ring,
          "x",
          {
            duration: 0.5,
            ease: "power3.out"
          }
        );

      ringY =
        window.gsap.quickTo(
          ring,
          "y",
          {
            duration: 0.5,
            ease: "power3.out"
          }
        );
    }


    hero.addEventListener(
      "pointermove",
      (event) => {
        const rect =
          hero.getBoundingClientRect();


        const x =
          (event.clientX -
            rect.left) /
            rect.width -
          0.5;


        const y =
          (event.clientY -
            rect.top) /
            rect.height -
          0.5;


        objectX(x * 22);
        objectY(y * 16);


        if (ringX && ringY) {
          ringX(x * 34);
          ringY(y * 24);
        }
      }
    );


    hero.addEventListener(
      "pointerleave",
      () => {
        objectX(0);
        objectY(0);

        if (ringX && ringY) {
          ringX(0);
          ringY(0);
        }
      }
    );
  };


  



  const initHeroScroll = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const hero =
      $(".home-hero");

    if (!hero) return;


    const word =
      $(".home-hero__word");

    const copy =
      $(".home-hero__copy");

    const cta =
      $(".home-hero__cta");


    if (word) {
      window.gsap.to(
        word,
        {
          xPercent: -3,

          yPercent: 8,

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


    if (copy) {
      window.gsap.to(
        copy,
        {
          y: 55,

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


    if (cta) {
      window.gsap.to(
        cta,
        {
          y: 85,
          rotation: 7,

          ease: "none",

          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1.1
          }
        }
      );
    }
  };


  



  const prepareRibbon = (track) => {
    if (!track) return null;


    let groups =
      Array.from(
        track.children
      ).filter((element) =>
        element.classList.contains(
          "home-ribbon__group"
        )
      );


    if (!groups.length) {
      return null;
    }


    if (groups.length === 1) {
      const clone =
        groups[0].cloneNode(true);

      stripCloneAttributes(clone);

      clone.setAttribute(
        "aria-hidden",
        "true"
      );

      clone.dataset.ribbonClone =
        "true";

      track.appendChild(clone);

      groups = [
        groups[0],
        clone
      ];
    }


    return groups[0];
  };


  const createRibbonLoop = (
    track,
    speed = 62
  ) => {
    if (
      !track ||
      state.reducedMotion ||
      !hasGSAP()
    ) {
      return;
    }


    const firstGroup =
      prepareRibbon(track);

    if (!firstGroup) return;


    const width =
      firstGroup.getBoundingClientRect()
        .width;


    if (width < 1) return;


    window.gsap.killTweensOf(track);

    window.gsap.set(
      track,
      {
        x: 0
      }
    );


    const duration =
      width / speed;


    const tween =
      window.gsap.to(
        track,
        {
          x: -width,

          duration,

          repeat: -1,

          ease: "none"
        }
      );


    state.ribbonLoops.push({
      track,
      tween
    });


    




    if (
      typeof IntersectionObserver !==
      "undefined"
    ) {
      const observer =
        new IntersectionObserver(
          (entries) => {
            entries.forEach(
              (entry) => {
                if (
                  entry.isIntersecting
                ) {
                  tween.play();
                } else {
                  tween.pause();
                }
              }
            );
          },
          {
            threshold: 0.01
          }
        );


      observer.observe(track);
    }
  };


  const initRibbons = () => {
    $$(
      ".home-ribbon__track"
    ).forEach((track) => {
      createRibbonLoop(
        track,
        Number(
          track.dataset.speed || 62
        )
      );
    });
  };


  



  const initAboutMotion = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const section =
      $(".home-about");

    if (!section) return;


    const title =
      $(".home-about__heading", section);

    const small =
      $(".home-about__small-media", section);

    const copy =
      $(".home-about__copy", section);

    const large =
      $(".home-about__large-media", section);

    const facts =
      $$(".home-about__fact", section);


    const timeline =
      window.gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 76%",
          once: true
        }
      });


    if (
      title &&
      !title.hasAttribute("data-aos")
    ) {
      timeline.from(
        title,
        {
          y: 38,
          autoAlpha: 0,
          duration: 0.85,
          ease: "power3.out"
        }
      );
    }


    if (
      small &&
      !small.hasAttribute("data-aos")
    ) {
      timeline.from(
        small,
        {
          x: -44,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out"
        },
        "-=0.48"
      );
    }


    if (
      copy &&
      !copy.hasAttribute("data-aos")
    ) {
      timeline.from(
        copy,
        {
          y: 34,
          autoAlpha: 0,
          duration: 0.82,
          ease: "power3.out"
        },
        "-=0.58"
      );
    }


    if (
      large &&
      !large.hasAttribute("data-aos")
    ) {
      timeline.from(
        large,
        {
          x: 50,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out"
        },
        "-=0.7"
      );
    }


    if (facts.length) {
      timeline.from(
        facts,
        {
          y: 24,
          autoAlpha: 0,

          duration: 0.7,

          stagger: 0.1,

          ease: "power3.out"
        },
        "-=0.48"
      );
    }


    const largeImage =
      large
        ? $("img", large)
        : null;


    if (largeImage) {
      window.gsap.fromTo(
        largeImage,
        {
          yPercent: -4
        },
        {
          yPercent: 4,

          ease: "none",

          scrollTrigger: {
            trigger: large,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8
          }
        }
      );
    }
  };


  



  const initServiceCards = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const section =
      $(".home-services");

    if (!section) return;


    const intro =
      $(".home-services__intro", section);

    const cards =
      $$(".service-step-card", section);


    if (
      intro &&
      !intro.hasAttribute("data-aos")
    ) {
      window.gsap.from(
        intro,
        {
          x: -38,
          autoAlpha: 0,

          duration: 0.9,
          ease: "power3.out",

          scrollTrigger: {
            trigger: intro,
            start: "top 82%",
            once: true
          }
        }
      );
    }


    if (cards.length) {
      window.ScrollTrigger.batch(
        cards,
        {
          start: "top 88%",
          once: true,

          onEnter(batch) {
            window.gsap.fromTo(
              batch,
              {
                y: 45,
                autoAlpha: 0
              },
              {
                y: 0,
                autoAlpha: 1,

                duration: 0.82,
                stagger: 0.1,

                ease: "power3.out"
              }
            );
          }
        }
      );
    }
  };


  



  const prepareHoverMarquee = (row) => {
    const track =
      $(
        ".service-hover-row__marquee-track",
        row
      );


    if (!track) return;


    let groups =
      Array.from(
        track.children
      ).filter((element) =>
        element.classList.contains(
          "service-hover-row__marquee-group"
        )
      );


    if (!groups.length) {
      return;
    }


    if (groups.length === 1) {
      const clone =
        groups[0].cloneNode(true);

      stripCloneAttributes(clone);

      clone.setAttribute(
        "aria-hidden",
        "true"
      );

      clone.dataset.marqueeClone =
        "true";

      track.appendChild(clone);
    }


    



    track.style.animationPlayState =
      "paused";
  };


  
















  const initServiceHoverRows = () => {
    const rows =
      $$(".service-hover-row");


    if (!rows.length) return;


    rows.forEach((row) => {
      prepareHoverMarquee(row);
    });


    if (
      !isDesktopHover() ||
      state.reducedMotion
    ) {
      return;
    }


    rows.forEach((row) => {
      const image =
        $(
          ".service-hover-row__image",
          row
        );

      const track =
        $(
          ".service-hover-row__marquee-track",
          row
        );


      if (!image) return;


      let xTo = null;
      let yTo = null;


      if (hasGSAP()) {
        xTo =
          window.gsap.quickTo(
            image,
            "left",
            {
              duration: 0.38,
              ease: "power3.out"
            }
          );


        yTo =
          window.gsap.quickTo(
            image,
            "top",
            {
              duration: 0.38,
              ease: "power3.out"
            }
          );
      }


      const moveImage = (
        clientX,
        clientY,
        immediate = false
      ) => {
        const rect =
          row.getBoundingClientRect();


        const imageRect =
          image.getBoundingClientRect();


        const halfWidth =
          Math.max(
            90,
            imageRect.width / 2
          );


        




        const minX =
          Math.min(
            rect.width * 0.38,
            rect.width - halfWidth
          );


        const maxX =
          Math.max(
            minX,
            rect.width -
              halfWidth -
              14
          );


        const localX =
          clamp(
            clientX - rect.left,
            minX,
            maxX
          );


        





        const localY =
          clamp(
            clientY - rect.top,
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


      const activate = (event) => {
        



        rows.forEach((otherRow) => {
          if (otherRow !== row) {
            otherRow.classList.remove(
              "is-active"
            );


            const otherTrack =
              $(
                ".service-hover-row__marquee-track",
                otherRow
              );


            if (otherTrack) {
              otherTrack.style.animationPlayState =
                "paused";
            }
          }
        });


        row.classList.add(
          "is-active"
        );


        if (track) {
          track.style.animationPlayState =
            "running";
        }


        if (event) {
          moveImage(
            event.clientX,
            event.clientY,
            true
          );
        }
      };


      const deactivate = () => {
        row.classList.remove(
          "is-active"
        );


        if (track) {
          track.style.animationPlayState =
            "paused";
        }
      };


      row.addEventListener(
        "pointerenter",
        activate
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


          moveImage(
            event.clientX,
            event.clientY
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


          if (track) {
            track.style.animationPlayState =
              "running";
          }


          const rect =
            row.getBoundingClientRect();


          moveImage(
            rect.left +
              rect.width * 0.67,

            rect.top +
              rect.height * 0.5,

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


  



  const initServiceShowcaseReveal = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const section =
      $(".home-service-showcase");

    if (!section) return;


    const head =
      $(".home-service-showcase__head", section);

    const rows =
      $$(".service-hover-row", section);


    if (
      head &&
      !head.hasAttribute("data-aos")
    ) {
      window.gsap.from(
        head,
        {
          y: 36,
          autoAlpha: 0,

          duration: 0.9,

          ease: "power3.out",

          scrollTrigger: {
            trigger: head,
            start: "top 84%",
            once: true
          }
        }
      );
    }


    if (rows.length) {
      window.ScrollTrigger.batch(
        rows,
        {
          start: "top 90%",
          once: true,

          onEnter(batch) {
            window.gsap.fromTo(
              batch,
              {
                y: 28,
                autoAlpha: 0
              },
              {
                y: 0,
                autoAlpha: 1,

                duration: 0.65,
                stagger: 0.08,

                ease: "power3.out"
              }
            );
          }
        }
      );
    }
  };


  



  const initParallax = () => {
    const section =
      $(".home-parallax");

    if (!section) return;


    const layers =
      $$(".home-parallax__image", section);

    const items =
      $$("[data-parallax-item]", section);


    if (
      layers.length < 2 ||
      !items.length
    ) {
      return;
    }


    const preloadImages =
      new Map();


    items.forEach((item) => {
      if (!item.dataset.parallaxImage) return;

      const preload =
        new Image();

      preload.src =
        item.dataset.parallaxImage;

      preloadImages.set(
        item.dataset.parallaxImage,
        preload
      );
    });


    let activeIndex =
      Math.max(
        items.findIndex((item) =>
          item.classList.contains("is-active")
        ),
        0
      );

    let visibleLayerIndex =
      layers.findIndex((layer) =>
        layer.classList.contains("is-visible")
      );

    if (visibleLayerIndex < 0) {
      visibleLayerIndex = 0;
      layers[0].classList.add("is-visible");
    }

    let pendingIndex =
      activeIndex;


    const setActiveItem = (nextIndex) => {
      items.forEach((item, index) => {
        const isActive =
          index === nextIndex;

        item.classList.toggle(
          "is-active",
          isActive
        );

        if (isActive) {
          item.setAttribute(
            "aria-current",
            "true"
          );
        } else {
          item.removeAttribute(
            "aria-current"
          );
        }
      });
    };


    const crossfade = (
      nextIndex,
      nextImage
    ) => {
      if (
        nextIndex === activeIndex ||
        !items[nextIndex]
      ) {
        return;
      }


      const hiddenLayerIndex =
        visibleLayerIndex === 0 ? 1 : 0;

      const visibleLayer =
        layers[visibleLayerIndex];

      const hiddenLayer =
        layers[hiddenLayerIndex];


      hiddenLayer.src =
        nextImage;

      hiddenLayer.style.objectPosition =
        items[nextIndex].dataset.parallaxPosition ||
        "center center";

      hiddenLayer.classList.add("is-visible");
      visibleLayer.classList.remove("is-visible");

      visibleLayerIndex =
        hiddenLayerIndex;

      activeIndex =
        nextIndex;

      setActiveItem(activeIndex);
    };


    const activate = (nextIndex) => {
      if (
        nextIndex === activeIndex ||
        !items[nextIndex]
      ) {
        return;
      }


      const nextImage =
        items[nextIndex].dataset.parallaxImage;

      if (!nextImage) return;

      pendingIndex =
        nextIndex;


      const preloaded =
        preloadImages.get(nextImage);

      if (
        preloaded &&
        !preloaded.complete
      ) {
        preloaded.addEventListener(
          "load",
          () => {
            if (pendingIndex === nextIndex) {
              crossfade(
                nextIndex,
                nextImage
              );
            }
          },
          {
            once: true
          }
        );

        return;
      }


      crossfade(
        nextIndex,
        nextImage
      );
    };


    setActiveItem(activeIndex);

    layers[visibleLayerIndex].style.objectPosition =
      items[activeIndex].dataset.parallaxPosition ||
      "center center";


    items.forEach((item, index) => {
      item.addEventListener(
        "pointerenter",
        () => {
          if (!isDesktopHover()) return;

          activate(index);
        }
      );

      item.addEventListener(
        "click",
        (event) => {
          if (isDesktopHover()) return;

          if (index !== activeIndex) {
            event.preventDefault();
            activate(index);
          }
        }
      );
    });
  };


  



  const initPrivacyScheme = () => {
    const section =
      $(".home-scheme");

    if (
      !section ||
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const head =
      $(".home-scheme__head", section);

    const media =
      $$(".privacy-scheme__media", section);

    const connectors =
      $$(
        ".privacy-scheme__connector",
        section
      );


    if (head) {
      window.gsap.from(
        head,
        {
          y: 36,
          autoAlpha: 0,

          duration: 0.85,

          ease: "power3.out",

          scrollTrigger: {
            trigger: head,
            start: "top 84%",
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
          stagger: 0.1,

          ease: "power3.out",

          scrollTrigger: {
            trigger:
              ".privacy-scheme",

            start: "top 83%",
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

          duration: 0.72,

          stagger: 0.11,

          ease: "power3.inOut",

          scrollTrigger: {
            trigger:
              ".privacy-scheme",

            start: "top 70%",
            once: true
          }
        }
      );
    }
  };


  



  const prepareSwiperSlides = (
    element,
    minimum = 7
  ) => {
    if (!element) return 0;


    if (
      element.dataset.loopPrepared ===
      "true"
    ) {
      return $$(
        ".swiper-wrapper > .swiper-slide",
        element
      ).length;
    }


    const wrapper =
      $(".swiper-wrapper", element);


    if (!wrapper) return 0;


    const originals =
      Array.from(
        wrapper.children
      ).filter((child) =>
        child.classList.contains(
          "swiper-slide"
        )
      );


    if (originals.length <= 1) {
      element.dataset.loopPrepared =
        "true";

      return originals.length;
    }


    let count =
      originals.length;

    let index = 0;


    while (count < minimum) {
      const source =
        originals[
          index % originals.length
        ];


      const clone =
        source.cloneNode(true);


      stripCloneAttributes(clone);


      clone.dataset.homeClone =
        "true";


      wrapper.appendChild(clone);


      count += 1;
      index += 1;
    }


    element.dataset.loopPrepared =
      "true";


    return count;
  };


  



  const initTestimonials = () => {
    const element =
      $(".testimonials-swiper");


    if (
      !element ||
      !hasSwiper()
    ) {
      return;
    }


    const count =
      prepareSwiperSlides(
        element,
        8
      );


    if (count <= 1) return;


    const pagination =
      $(".swiper-pagination", element);


    const swiper =
      new window.Swiper(
        element,
        {
          slidesPerView: 1,

          spaceBetween: 18,

          centeredSlides: false,

          loop: true,

          loopedSlides: count,

          loopAdditionalSlides: 2,

          loopPreventsSliding: false,

          speed: 950,

          grabCursor: true,

          watchSlidesProgress: true,

          observer: true,

          observeParents: true,

          resistanceRatio: 0.66,

          keyboard: {
            enabled: true,
            onlyInViewport: true
          },

          pagination:
            pagination
              ? {
                  el: pagination,
                  clickable: true
                }
              : undefined,

          breakpoints: {
            640: {
              slidesPerView: 2,
              spaceBetween: 24
            },

            1000: {
              slidesPerView: 2,
              spaceBetween: 28
            },

            1280: {
              slidesPerView: 2,
              spaceBetween: 34
            },

            1500: {
              slidesPerView: 2,
              spaceBetween: 38
            }
          }
        }
      );


    state.swipers.push(swiper);
  };


  



  const initTestimonialsReveal = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const section =
      $(".home-testimonials");

    if (!section) return;


    const head =
      $(".home-testimonials__head");

    const swiper =
      $(".testimonials-swiper");


    if (head) {
      window.gsap.from(
        head,
        {
          y: 40,
          autoAlpha: 0,

          duration: 0.85,

          ease: "power3.out",

          scrollTrigger: {
            trigger: head,
            start: "top 86%",
            once: true
          }
        }
      );
    }


    if (swiper) {
      window.gsap.from(
        swiper,
        {
          y: 38,
          autoAlpha: 0,

          duration: 0.95,

          ease: "power3.out",

          scrollTrigger: {
            trigger: swiper,
            start: "top 88%",
            once: true
          }
        }
      );
    }
  };


  



  const initPrinciples = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const section =
      $(".home-principles");

    if (!section) return;


    const head =
      $(".home-principles__head", section);

    const cards =
      $$(".principle-card", section);


    if (head) {
      window.gsap.from(
        head,
        {
          y: 35,
          autoAlpha: 0,

          duration: 0.85,

          ease: "power3.out",

          scrollTrigger: {
            trigger: head,
            start: "top 84%",
            once: true
          }
        }
      );
    }


    if (cards.length) {
      window.ScrollTrigger.batch(
        cards,
        {
          start: "top 90%",
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

                ease: "power3.out"
              }
            );
          }
        }
      );
    }
  };


  




  const initFAQReveal = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const section =
      $(".home-faq");

    if (!section) return;


    const head =
      $(".home-faq__head", section);

    const columns =
      $$(".home-faq__column", section);


    if (head) {
      window.gsap.from(
        head,
        {
          y: 32,
          autoAlpha: 0,

          duration: 0.82,

          ease: "power3.out",

          scrollTrigger: {
            trigger: head,
            start: "top 87%",
            once: true
          }
        }
      );
    }


    if (columns.length) {
      window.gsap.from(
        columns,
        {
          y: 34,
          autoAlpha: 0,

          duration: 0.85,

          stagger: 0.12,

          ease: "power3.out",

          scrollTrigger: {
            trigger:
              ".home-faq__columns",

            start: "top 86%",
            once: true
          }
        }
      );
    }
  };


  



  const initContactReveal = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    const section =
      $(".home-contact");

    if (!section) return;


    const intro =
      $(".home-contact__intro");

    const form =
      $(".home-contact__form");


    if (
      intro &&
      !intro.hasAttribute("data-aos")
    ) {
      window.gsap.from(
        intro,
        {
          x: -38,
          autoAlpha: 0,

          duration: 0.9,

          ease: "power3.out",

          scrollTrigger: {
            trigger: intro,
            start: "top 84%",
            once: true
          }
        }
      );
    }


    if (
      form &&
      !form.hasAttribute("data-aos")
    ) {
      window.gsap.from(
        form,
        {
          x: 38,
          autoAlpha: 0,

          duration: 0.9,

          ease: "power3.out",

          scrollTrigger: {
            trigger: form,
            start: "top 84%",
            once: true
          }
        }
      );
    }
  };


  



  const initLabels = () => {
    if (
      state.reducedMotion ||
      !hasGSAP() ||
      !hasScrollTrigger()
    ) {
      return;
    }


    $$(".ref-label").forEach(
      (label) => {
        if (
          label.hasAttribute(
            "data-aos"
          )
        ) {
          return;
        }


        





        if (
          label.closest(
            ".home-about__heading, " +
            ".home-services__intro, " +
            ".home-service-showcase__head, " +
            ".home-scheme__head, " +
            ".home-testimonials__head, " +
            ".home-principles__head, " +
            ".home-faq__head, " +
            ".home-contact__intro"
          )
        ) {
          return;
        }


        window.gsap.from(
          label,
          {
            y: 15,
            autoAlpha: 0,

            duration: 0.6,

            ease: "power3.out",

            scrollTrigger: {
              trigger: label,
              start: "top 90%",
              once: true
            }
          }
        );
      }
    );
  };


  



  const updateLayout = () => {
    state.swipers.forEach(
      (swiper) => {
        if (
          swiper &&
          !swiper.destroyed &&
          typeof swiper.update ===
            "function"
        ) {
          swiper.update();
        }
      }
    );
  };


  const refresh = () => {
    requestGlobalRefresh();
  };


  



  const rebuildRibbons = () => {
    state.ribbonLoops.forEach(
      ({ tween }) => {
        if (tween) {
          tween.kill();
        }
      }
    );


    state.ribbonLoops = [];


    $$(
      ".home-ribbon__track"
    ).forEach((track) => {
      window.gsap.set(
        track,
        {
          clearProps: "x"
        }
      );


      createRibbonLoop(
        track,
        Number(
          track.dataset.speed || 62
        )
      );
    });
  };


  const initResize = () => {
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(
          state.resizeTimer
        );


        state.resizeTimer =
          window.setTimeout(
            () => {
              if (
                hasGSAP() &&
                !state.reducedMotion
              ) {
                rebuildRibbons();
              }

              updateLayout();

              requestGlobalRefresh();
            },
            220
          );
      },
      {
        passive: true
      }
    );
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


    initHeroObjectMotion();

    initHeroPointer();

    initHeroScroll();

    initAboutMotion();

    initServiceCards();

    initServiceShowcaseReveal();

    initPrivacyScheme();

    initTestimonialsReveal();

    initPrinciples();

    initFAQReveal();

    initContactReveal();

    initLabels();
  };


  



  const init = () => {
    if (state.initialized) return;


    const home =
      $(".home-page");


    if (!home) {
      showHeroImmediately();
      return;
    }


    state.initialized = true;


    






    initServiceHoverRows();


    



    initParallax();


    



    if (
      hasGSAP() &&
      !state.reducedMotion
    ) {
      initRibbons();
    }


    



    initTestimonials();


    



    initMotion();


    



    waitForLoader();


    initResize();

  };


  



  window.PrivoraHome = {
    init,

    refresh,

    updateLayout,

    state,

    getSwipers() {
      return [
        ...state.swipers
      ];
    }
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
