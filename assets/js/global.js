/* =========================================================
   PRIVORA — GLOBAL JAVASCRIPT
   Digital Privacy & Online Security

   This file REPLACES the previous global.js.

   Requires:
   - config/config.js
   - AOS
   - GSAP
   - ScrollTrigger
   - Lenis

   Responsibilities:
   - config binding
   - logo / favicon
   - browser title
   - navigation
   - sticky header state
   - mobile menu
   - page loader
   - page transitions
   - Lenis
   - AOS
   - accordions
   - cookie consent
   - contact forms
   - back to top
   - internal anchors
   - hover reveal
   - custom cursor
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     01. HTML JS STATE
     ======================================================= */

  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");


  /* =======================================================
     02. GLOBAL STATE
     ======================================================= */

  const state = {
    initialized: false,

    loaderHidden: false,

    menuOpen: false,

    navigationLocked: false,

    reducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches,

    finePointer: window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches,

    lenis: null,

    lenisTickerConnected: false,

    resizeTimer: null,

    scrollLockedByMenu: false
  };


  /* =======================================================
     03. HELPERS
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


  const hasLenis = () =>
    typeof window.Lenis !== "undefined";


  const hasAOS = () =>
    typeof window.AOS !== "undefined";


  const safeDecode = (value) => {
    try {
      return decodeURIComponent(value);
    } catch (_) {
      return value;
    }
  };


  /* =======================================================
     04. FIND GLOBAL SCRIPT
     -------------------------------------------------------
     We use global.js location to calculate project root.

     Example:

     /project/assets/js/global.js

     root becomes:

     /project/

     Therefore config paths such as:

     assets/icons/logo.svg

     also work correctly from:

     /services/privacy-protection.html
     ======================================================= */

  const getGlobalScriptElement = () => {
    const scripts = Array.from(
      document.scripts
    );

    return scripts.find((script) => {
      if (!script.src) {
        return false;
      }

      return /\/assets\/js\/global\.js(?:\?.*)?$/i
        .test(script.src);
    }) || null;
  };


  const globalScript =
    getGlobalScriptElement();


  const SITE_ROOT = (() => {
    try {
      if (
        globalScript &&
        globalScript.src
      ) {
        return new URL(
          "../../",
          globalScript.src
        );
      }
    } catch (_) {
      /* no-op */
    }

    return new URL(
      "./",
      window.location.href
    );
  })();


  /* =======================================================
     05. PATH RESOLUTION
     ======================================================= */

  const resolveSitePath = (
    value
  ) => {
    if (
      value === null ||
      typeof value === "undefined"
    ) {
      return "";
    }


    const path =
      String(value).trim();


    if (!path) {
      return "";
    }


    /*
     Leave special protocols alone.
    */

    if (
      path.startsWith("#") ||
      path.startsWith("mailto:") ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    ) {
      return path;
    }


    try {
      return new URL(
        path,
        SITE_ROOT
      ).href;
    } catch (_) {
      return path;
    }
  };


  /* =======================================================
     06. CONFIG
     ======================================================= */

  const config =
    window.SiteConfig || {};


  const getConfigValue = (
    path
  ) => {
    if (!path) {
      return undefined;
    }


    return path
      .split(".")
      .reduce(
        (current, key) => {
          if (
            current === null ||
            typeof current ===
              "undefined"
          ) {
            return undefined;
          }

          return current[key];
        },
        config
      );
  };


  /* =======================================================
     07. TEMPLATE REPLACEMENT
     ======================================================= */

  const formatTemplate = (
    value
  ) => {
    if (
      value === null ||
      typeof value === "undefined"
    ) {
      return "";
    }


    let output =
      String(value);


    const values = {
      companyName:
        config.companyName || "",

      companyShortName:
        config.companyShortName ||
        config.companyName ||
        "",

      email:
        config.email || "",

      titleSeparator:
        config.titleSeparator ||
        " | ",

      serviceArea:
        config.serviceArea || "",

      availabilityText:
        config.availabilityText || ""
    };


    Object.entries(
      values
    ).forEach(
      ([key, replacement]) => {
        output =
          output.replace(
            new RegExp(
              `\\{${key}\\}`,
              "g"
            ),
            replacement
          );
      }
    );


    return output;
  };


  /* =======================================================
     08. PAGE KEY
     ======================================================= */

  const getPageKey = () => {
    const bodyPage =
      document.body?.dataset?.page;


    if (bodyPage) {
      return bodyPage;
    }


    const pathname =
      window.location.pathname
        .toLowerCase();


    if (
      pathname.endsWith("/") ||
      pathname.endsWith(
        "/index.html"
      )
    ) {
      return "home";
    }


    if (
      pathname.includes(
        "privacy-protection"
      )
    ) {
      return "privacyProtection";
    }


    if (
      pathname.includes(
        "online-security"
      )
    ) {
      return "onlineSecurity";
    }


    if (
      pathname.endsWith(
        "/privacy.html"
      )
    ) {
      return "privacy";
    }


    if (
      pathname.endsWith(
        "/terms.html"
      )
    ) {
      return "terms";
    }


    if (
      pathname.endsWith(
        "/cookies.html"
      )
    ) {
      return "cookies";
    }


    return "home";
  };


  /* =======================================================
     09. NORMALIZE INDEX PATH
     -------------------------------------------------------
     Treat:

     /project/
     /project/index.html

     as the same page.
     ======================================================= */

  const normalizePagePath = (
    pathname
  ) => {
    let path =
      pathname || "/";


    path =
      path.replace(
        /\/index\.html$/i,
        "/"
      );


    if (!path.endsWith("/")) {
      return path;
    }


    return path;
  };


  const isSamePage = (
    url
  ) => {
    return (
      url.origin ===
        window.location.origin &&

      normalizePagePath(
        url.pathname
      ) ===
        normalizePagePath(
          window.location.pathname
        ) &&

      url.search ===
        window.location.search
    );
  };


  /* =======================================================
     10. APPLY COMPANY NAME
     ======================================================= */

  const applyCompanyName = () => {
    if (!config.companyName) {
      return;
    }


    $$(
      "[data-company-name]"
    ).forEach((element) => {
      element.textContent =
        config.companyName;
    });
  };


  /* =======================================================
     11. APPLY LOGO
     ======================================================= */

  const applyLogo = () => {
    if (!config.logo) {
      return;
    }


    const logoUrl =
      resolveSitePath(
        config.logo
      );


    $$(
      "[data-site-logo]"
    ).forEach((image) => {
      if (
        !(
          image instanceof
          HTMLImageElement
        )
      ) {
        return;
      }


      image.src = logoUrl;


      /*
       Preserve alt="" on decorative logos.

       For actual brand logos we replace
       the hard-coded company name.
      */

      if (
        image.getAttribute("alt") !==
        ""
      ) {
        image.alt =
          config.companyName
            ? `${config.companyName} logo`
            : "Site logo";
      }
    });
  };


  /* =======================================================
     12. FAVICON
     ======================================================= */

  const applyFavicon = () => {
    if (!config.favicon) {
      return;
    }


    const faviconUrl =
      resolveSitePath(
        config.favicon
      );


    let favicon =
      $(
        'link[rel="icon"]'
      );


    if (!favicon) {
      favicon =
        document.createElement(
          "link"
        );

      favicon.rel = "icon";

      document.head.appendChild(
        favicon
      );
    }


    favicon.type =
      "image/svg+xml";

    favicon.href =
      faviconUrl;
  };


  /* =======================================================
     13. BROWSER TITLE
     ======================================================= */

  const applyBrowserTitle = () => {
    const pageKey =
      getPageKey();


    const titles =
      config.pageTitles || {};


    const rawTitle =
      titles[pageKey] ||
      config.browserTitle ||
      config.companyName ||
      document.title;


    const title =
      formatTemplate(
        rawTitle
      );


    if (title) {
      document.title = title;
    }
  };


  /* =======================================================
     14. META DESCRIPTION
     ======================================================= */

  const applyMetaDescription = () => {
    if (!config.metaDescription) {
      return;
    }


    let element =
      $(
        'meta[name="description"]'
      );


    if (!element) {
      element =
        document.createElement(
          "meta"
        );

      element.name =
        "description";

      document.head.appendChild(
        element
      );
    }


    element.content =
      formatTemplate(
        config.metaDescription
      );
  };


  /* =======================================================
     15. EMAIL
     ======================================================= */

  const applyEmail = () => {
    if (!config.email) {
      return;
    }


    $$(
      "[data-site-email]"
    ).forEach((element) => {
      element.textContent =
        config.email;


      if (
        element instanceof
        HTMLAnchorElement
      ) {
        element.href =
          `mailto:${config.email}`;
      }
    });
  };


  /* =======================================================
     16. DISCLAIMER
     ======================================================= */

  const applyDisclaimer = () => {
    if (!config.disclaimer) {
      return;
    }


    const value =
      formatTemplate(
        config.disclaimer
      );


    $$(
      "[data-site-disclaimer]"
    ).forEach((element) => {
      element.textContent =
        value;
    });
  };


  /* =======================================================
     17. CURRENT YEAR
     ======================================================= */

  const applyCurrentYear = () => {
    const year =
      new Date().getFullYear();


    $$(
      "[data-current-year]"
    ).forEach((element) => {
      element.textContent =
        String(year);
    });
  };


  /* =======================================================
     18. GENERAL CONFIG TEXT
     ======================================================= */

  const applyGeneralText = () => {
    if (config.serviceArea) {
      $$(
        "[data-service-area]"
      ).forEach((element) => {
        element.textContent =
          formatTemplate(
            config.serviceArea
          );
      });
    }


    if (
      config.availabilityText
    ) {
      $$(
        "[data-availability-text]"
      ).forEach((element) => {
        element.textContent =
          formatTemplate(
            config.availabilityText
          );
      });
    }


    $$(
      "[data-config-text]"
    ).forEach((element) => {
      const key =
        element.dataset.configText;


      const value =
        getConfigValue(key);


      if (
        value === null ||
        typeof value ===
          "undefined"
      ) {
        return;
      }


      element.textContent =
        formatTemplate(
          value
        );
    });
  };


  /* =======================================================
     19. NAVIGATION FROM CONFIG
     ======================================================= */

  const applyNavigation = () => {
    const navigation =
      config.navigation || {};


    const pageKey =
      getPageKey();


    $$(
      "[data-nav-key]"
    ).forEach((link) => {
      if (
        !(
          link instanceof
          HTMLAnchorElement
        )
      ) {
        return;
      }


      const key =
        link.dataset.navKey;


      const configuredPath =
        navigation[key];


      if (!configuredPath) {
        return;
      }


      /*
       On HOME:

       About / Contact remain simple hashes.

       This gives instant smooth scrolling and
       avoids unnecessarily navigating to
       index.html#about.
      */

      if (
        pageKey === "home" &&
        (
          key === "about" ||
          key === "contact"
        )
      ) {
        const hashIndex =
          configuredPath.indexOf("#");


        if (hashIndex !== -1) {
          link.href =
            configuredPath.slice(
              hashIndex
            );

          return;
        }
      }


      link.href =
        resolveSitePath(
          configuredPath
        );
    });
  };


  /* =======================================================
     20. SERVICE CONFIG BINDING
     ======================================================= */

  const applyServices = () => {
    if (
      !Array.isArray(
        config.services
      )
    ) {
      return;
    }


    $$(
      "[data-service-link]"
    ).forEach((element) => {
      const index =
        Number(
          element.dataset.serviceLink
        );


      const service =
        config.services[index];


      if (
        !service ||
        !service.url
      ) {
        return;
      }


      if (
        element instanceof
        HTMLAnchorElement
      ) {
        element.href =
          resolveSitePath(
            service.url
          );
      }
    });


    $$(
      "[data-service-name]"
    ).forEach((element) => {
      const index =
        Number(
          element.dataset.serviceName
        );


      const service =
        config.services[index];


      if (!service) {
        return;
      }


      element.textContent =
        service.name || "";
    });


    $$(
      "[data-service-short-name]"
    ).forEach((element) => {
      const index =
        Number(
          element.dataset
            .serviceShortName
        );


      const service =
        config.services[index];


      if (!service) {
        return;
      }


      element.textContent =
        service.shortName ||
        service.name ||
        "";
    });
  };


  /* =======================================================
     21. CLEAR NAV ACTIVE STATE
     ======================================================= */

  const clearActiveNavigation = () => {
    $$(
      "[data-nav-key]"
    ).forEach((element) => {
      element.classList.remove(
        "is-active"
      );

      element.removeAttribute(
        "aria-current"
      );
    });
  };


  /* =======================================================
     22. ACTIVE NAVIGATION
     ======================================================= */

  const setPageNavigation = () => {
    clearActiveNavigation();


    const pageKey =
      getPageKey();


    let navKey = null;


    switch (pageKey) {
      case "home":
        navKey = "home";
        break;

      case "privacy":
        navKey = "privacy";
        break;

      case "terms":
        navKey = "terms";
        break;

      case "cookies":
        navKey = "cookies";
        break;

      default:
        navKey = null;
        break;
    }


    if (!navKey) {
      return;
    }


    $$(
      `[data-nav-key="${navKey}"]`
    ).forEach((element) => {
      element.classList.add(
        "is-active"
      );


      if (
        element instanceof
        HTMLAnchorElement
      ) {
        element.setAttribute(
          "aria-current",
          "page"
        );
      }
    });
  };


  /* =======================================================
     23. APPLY CONFIG
     ======================================================= */

  const applyConfig = () => {
    applyCompanyName();

    applyLogo();

    applyFavicon();

    applyBrowserTitle();

    applyMetaDescription();

    applyEmail();

    applyDisclaimer();

    applyCurrentYear();

    applyGeneralText();

    applyNavigation();

    applyServices();

    setPageNavigation();


    window.dispatchEvent(
      new CustomEvent(
        "privora:config-ready",
        {
          detail: {
            config,

            root:
              SITE_ROOT.href
          }
        }
      )
    );
  };


  /* =======================================================
     24. GSAP REGISTRATION
     ======================================================= */

  const registerGSAP = () => {
    if (
      hasGSAP() &&
      hasScrollTrigger()
    ) {
      try {
        window.gsap.registerPlugin(
          window.ScrollTrigger
        );
      } catch (_) {
        /* no-op */
      }
    }
  };


  /* =======================================================
     25. HEADER SCROLL STATE
     ======================================================= */

  const initHeader = () => {
    const header =
      $(".site-header");


    if (!header) {
      return;
    }


    let ticking = false;


    const update = () => {
      header.classList.toggle(
        "is-scrolled",
        window.scrollY > 16
      );

      ticking = false;
    };


    const requestUpdate = () => {
      if (ticking) {
        return;
      }


      ticking = true;


      window.requestAnimationFrame(
        update
      );
    };


    update();


    window.addEventListener(
      "scroll",
      requestUpdate,
      {
        passive: true
      }
    );
  };


  /* =======================================================
     26. LENIS
     ======================================================= */

  const initLenis = () => {
    if (
      state.reducedMotion ||
      !hasLenis() ||
      state.lenis
    ) {
      return;
    }


    try {
      state.lenis =
        new window.Lenis({
          duration: 1.06,

          smoothWheel: true,

          syncTouch: false,

          wheelMultiplier: 0.9,

          touchMultiplier: 1
        });
    } catch (error) {
      console.warn(
        "Lenis initialization failed:",
        error
      );

      state.lenis = null;

      return;
    }


    window.PrivoraLenis =
      state.lenis;


    /*
     GSAP ticker integration.
    */

    if (
      hasGSAP() &&
      hasScrollTrigger()
    ) {
      state.lenis.on(
        "scroll",
        window.ScrollTrigger.update
      );


      window.gsap.ticker.add(
        (time) => {
          if (state.lenis) {
            state.lenis.raf(
              time * 1000
            );
          }
        }
      );


      window.gsap.ticker.lagSmoothing(
        0
      );


      state.lenisTickerConnected =
        true;


      return;
    }


    /*
     Fallback RAF if GSAP does not exist.
    */

    const raf = (
      time
    ) => {
      if (!state.lenis) {
        return;
      }


      state.lenis.raf(time);


      window.requestAnimationFrame(
        raf
      );
    };


    window.requestAnimationFrame(
      raf
    );
  };


  /* =======================================================
     27. AOS
     -------------------------------------------------------
     AOS only handles elements explicitly using data-aos.

     index.js and service.js deliberately skip elements
     controlled by AOS.
     ======================================================= */

  const initAOS = () => {
    if (!hasAOS()) {
      return;
    }


    try {
      window.AOS.init({
        duration:
          state.reducedMotion
            ? 0
            : 700,

        once: true,

        mirror: false,

        offset: 35,

        delay: 0,

        easing:
          "ease-out-cubic",

        anchorPlacement:
          "top-bottom",

        disableMutationObserver:
          false
      });
    } catch (error) {
      console.warn(
        "AOS initialization failed:",
        error
      );
    }
  };


  /* =======================================================
     28. MOBILE MENU
     ======================================================= */

  const initMobileMenu = () => {
    const toggle =
      $(".menu-toggle");


    const menu =
      $(".mobile-menu");


    if (
      !toggle ||
      !menu
    ) {
      return;
    }


    const open = () => {
      if (state.menuOpen) {
        return;
      }


      state.menuOpen = true;


      toggle.classList.add(
        "is-active"
      );


      menu.classList.add(
        "is-open"
      );


      document.body.classList.add(
        "menu-open"
      );


      toggle.setAttribute(
        "aria-expanded",
        "true"
      );


      toggle.setAttribute(
        "aria-label",
        "Close navigation menu"
      );


      menu.setAttribute(
        "aria-hidden",
        "false"
      );


      if (
        state.lenis &&
        typeof state.lenis.stop ===
          "function"
      ) {
        state.lenis.stop();

        state.scrollLockedByMenu =
          true;
      }


      window.dispatchEvent(
        new CustomEvent(
          "privora:menu-open"
        )
      );
    };


    const close = () => {
      if (!state.menuOpen) {
        return;
      }


      state.menuOpen = false;


      toggle.classList.remove(
        "is-active"
      );


      menu.classList.remove(
        "is-open"
      );


      document.body.classList.remove(
        "menu-open"
      );


      toggle.setAttribute(
        "aria-expanded",
        "false"
      );


      toggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );


      menu.setAttribute(
        "aria-hidden",
        "true"
      );


      if (
        state.lenis &&
        state.scrollLockedByMenu &&
        typeof state.lenis.start ===
          "function"
      ) {
        state.lenis.start();

        state.scrollLockedByMenu =
          false;
      }


      window.dispatchEvent(
        new CustomEvent(
          "privora:menu-close"
        )
      );
    };


    const toggleMenu = () => {
      if (state.menuOpen) {
        close();
      } else {
        open();
      }
    };


    toggle.setAttribute(
      "aria-expanded",
      "false"
    );


    menu.setAttribute(
      "aria-hidden",
      "true"
    );


    toggle.addEventListener(
      "click",
      toggleMenu
    );


    /*
     Close after selecting a link.
    */

    menu.addEventListener(
      "click",
      (event) => {
        const link =
          event.target.closest("a");


        if (link) {
          close();
        }
      }
    );


    /*
     ESC.
    */

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Escape" &&
          state.menuOpen
        ) {
          close();

          toggle.focus();
        }
      }
    );


    /*
     Desktop breakpoint.
    */

    window.addEventListener(
      "resize",
      () => {
        if (
          window.innerWidth >
            1180 &&
          state.menuOpen
        ) {
          close();
        }
      },
      {
        passive: true
      }
    );


    window.PrivoraMenu = {
      open,
      close,
      toggle: toggleMenu
    };
  };


  /* =======================================================
     29. ACCORDION
     ======================================================= */

  const initAccordions = () => {
    $$(
      ".accordion"
    ).forEach((accordion) => {
      const items =
        $$(
          ".accordion-item",
          accordion
        );


      if (!items.length) {
        return;
      }


      const single =
        accordion.dataset
          .accordionSingle !==
        "false";


      const closeItem = (
        item
      ) => {
        const button =
          $(
            ".accordion-button",
            item
          );


        item.classList.remove(
          "is-open"
        );


        button?.setAttribute(
          "aria-expanded",
          "false"
        );
      };


      const openItem = (
        item
      ) => {
        if (single) {
          items.forEach(
            (otherItem) => {
              if (
                otherItem !== item
              ) {
                closeItem(
                  otherItem
                );
              }
            }
          );
        }


        item.classList.add(
          "is-open"
        );


        const button =
          $(
            ".accordion-button",
            item
          );


        button?.setAttribute(
          "aria-expanded",
          "true"
        );
      };


      items.forEach(
        (item) => {
          const button =
            $(
              ".accordion-button",
              item
            );


          if (!button) {
            return;
          }


          button.setAttribute(
            "aria-expanded",

            item.classList.contains(
              "is-open"
            )
              ? "true"
              : "false"
          );


          button.addEventListener(
            "click",
            () => {
              const currentlyOpen =
                item.classList.contains(
                  "is-open"
                );


              if (currentlyOpen) {
                closeItem(item);
              } else {
                openItem(item);
              }


              window.setTimeout(
                refreshLayout,
                520
              );
            }
          );
        }
      );


      /*
       Optional automatic first item.
      */

      if (
        accordion.dataset
          .openFirst ===
          "true" &&
        !items.some((item) =>
          item.classList.contains(
            "is-open"
          )
        )
      ) {
        openItem(items[0]);
      }
    });
  };


  /* =======================================================
     30. STORAGE HELPERS
     ======================================================= */

  const storageGet = (
    key
  ) => {
    try {
      return window.localStorage
        .getItem(key);
    } catch (_) {
      return null;
    }
  };


  const storageSet = (
    key,
    value
  ) => {
    try {
      window.localStorage
        .setItem(
          key,
          value
        );
    } catch (_) {
      /* no-op */
    }
  };


  const storageRemove = (
    key
  ) => {
    try {
      window.localStorage
        .removeItem(key);
    } catch (_) {
      /* no-op */
    }
  };


  /* =======================================================
     31. COOKIE CONSENT
     ======================================================= */

  const COOKIE_KEY =
    "privora_cookie_preference_v1";


  const initCookieConsent = () => {
    const banner =
      $(".cookie-consent");


    if (!banner) {
      return;
    }


    const accept =
      $(
        "[data-cookie-accept]",
        banner
      );


    const decline =
      $(
        "[data-cookie-decline]",
        banner
      );


    const show = () => {
      banner.classList.add(
        "is-visible"
      );
    };


    const hide = () => {
      banner.classList.remove(
        "is-visible"
      );
    };


    const choose = (
      value
    ) => {
      storageSet(
        COOKIE_KEY,
        value
      );


      hide();


      window.dispatchEvent(
        new CustomEvent(
          "privora:cookie-choice",
          {
            detail: {
              value
            }
          }
        )
      );
    };


    if (
      !storageGet(
        COOKIE_KEY
      )
    ) {
      window.setTimeout(
        show,
        650
      );
    }


    accept?.addEventListener(
      "click",
      () => {
        choose("accepted");
      }
    );


    decline?.addEventListener(
      "click",
      () => {
        choose("declined");
      }
    );


    window.PrivoraCookies = {
      show,

      hide,

      reset() {
        storageRemove(
          COOKIE_KEY
        );

        show();
      }
    };
  };


  /* =======================================================
     32. CONTACT FORM STATUS
     ======================================================= */

  const setFormStatus = (
    form,
    type,
    message
  ) => {
    const status =
      $(
        ".form-status",
        form
      );


    if (!status) {
      return;
    }


    status.classList.remove(
      "is-visible",
      "is-success",
      "is-error"
    );


    status.textContent =
      message || "";


    if (!message) {
      return;
    }


    status.classList.add(
      "is-visible"
    );


    status.classList.add(
      type === "success"
        ? "is-success"
        : "is-error"
    );
  };


  const getFormConfigMessage = (
    key,
    fallback
  ) => {
    return (
      config.contactForm?.[key] ||
      fallback
    );
  };


  /* =======================================================
     33. CONTACT FORMS
     ======================================================= */

  const initContactForms = () => {
    $$(
      "[data-contact-form]"
    ).forEach((form) => {
      form.addEventListener(
        "submit",
        async (event) => {
          event.preventDefault();


          if (
            !form.checkValidity()
          ) {
            form.reportValidity();


            setFormStatus(
              form,
              "error",
              getFormConfigMessage(
                "validationMessage",
                "Please complete all required fields."
              )
            );


            return;
          }


          const submitButton =
            form.querySelector(
              'button[type="submit"], input[type="submit"]'
            );


          const originalText =
            submitButton
              ? (
                  submitButton.tagName ===
                  "INPUT"
                    ? submitButton.value
                    : submitButton.textContent
                )
              : "";


          if (submitButton) {
            submitButton.disabled =
              true;


            if (
              submitButton.tagName ===
              "INPUT"
            ) {
              submitButton.value =
                "Sending...";
            } else {
              submitButton.textContent =
                "Sending...";
            }
          }


          setFormStatus(
            form,
            "",
            ""
          );


          try {
            const formData =
              new FormData(form);


            /*
             This project deliberately
             does not use phone fields.

             Even if somebody accidentally
             adds one later, do not send it.
            */

            [
              "phone",
              "tel",
              "telephone",
              "mobile"
            ].forEach((key) => {
              formData.delete(key);
            });


            const honeypot =
              String(
                formData.get(
                  "website"
                ) || ""
              ).trim();


            /*
             Silent success for bots.
            */

            if (honeypot) {
              setFormStatus(
                form,
                "success",
                getFormConfigMessage(
                  "successMessage",
                  "Thank you. Your message has been successfully sent."
                )
              );


              form.reset();

              return;
            }


            const configuredEndpoint =
              config.contactForm
                ?.endpoint ||
              "contact.php";


            const formAction =
              form.getAttribute(
                "action"
              );


            const endpoint =
              resolveSitePath(
                formAction &&
                formAction !== "#"
                  ? formAction
                  : configuredEndpoint
              );


            const response =
              await fetch(
                endpoint,
                {
                  method: "POST",

                  body: formData,

                  headers: {
                    Accept:
                      "application/json"
                  }
                }
              );


            const contentType =
              response.headers.get(
                "content-type"
              ) || "";


            let payload = {};


            if (
              contentType.includes(
                "application/json"
              )
            ) {
              payload =
                await response.json();
            } else {
              const responseText =
                await response.text();


              payload = {
                success:
                  response.ok,

                message:
                  responseText.trim()
              };
            }


            if (
              !response.ok ||
              payload.success === false
            ) {
              throw new Error(
                payload.message ||
                "Form request failed."
              );
            }


            setFormStatus(
              form,
              "success",
              payload.message ||
                getFormConfigMessage(
                  "successMessage",
                  "Thank you. Your message has been successfully sent."
                )
            );


            form.reset();


            window.dispatchEvent(
              new CustomEvent(
                "privora:form-success"
              )
            );
          } catch (error) {
            console.error(
              "Contact form error:",
              error
            );


            setFormStatus(
              form,
              "error",
              getFormConfigMessage(
                "errorMessage",
                "Something went wrong. Please try again."
              )
            );
          } finally {
            if (
              submitButton
            ) {
              submitButton.disabled =
                false;


              if (
                submitButton.tagName ===
                "INPUT"
              ) {
                submitButton.value =
                  originalText;
              } else {
                submitButton.textContent =
                  originalText;
              }
            }
          }
        }
      );
    });
  };


  /* =======================================================
     34. LOADER
     ======================================================= */

  const initLoader = () => {
    const loader =
      $(".page-loader");


    if (!loader) {
      document.body.classList.remove(
        "is-loading"
      );


      state.loaderHidden =
        true;


      window.dispatchEvent(
        new CustomEvent(
          "privora:loader-hidden"
        )
      );


      return;
    }


    const started =
      performance.now();


    /*
     Short enough to avoid annoying the user,
     but visible enough to feel intentional.
    */

    const minimumTime =
      state.reducedMotion
        ? 0
        : 520;


    const hide = () => {
      if (
        state.loaderHidden
      ) {
        return;
      }


      state.loaderHidden =
        true;


      loader.classList.add(
        "is-hidden"
      );


      document.body.classList.remove(
        "is-loading"
      );


      window.dispatchEvent(
        new CustomEvent(
          "privora:loader-hidden"
        )
      );


      window.setTimeout(
        () => {
          loader.setAttribute(
            "aria-hidden",
            "true"
          );
        },
        700
      );
    };


    const complete = () => {
      const elapsed =
        performance.now() -
        started;


      const remaining =
        Math.max(
          0,
          minimumTime - elapsed
        );


      window.setTimeout(
        hide,
        remaining
      );
    };


    if (
      document.readyState ===
      "complete"
    ) {
      complete();
    } else {
      window.addEventListener(
        "load",
        complete,
        {
          once: true
        }
      );
    }


    /*
     Absolute safety fallback.
    */

    window.setTimeout(
      hide,
      3500
    );
  };


  /* =======================================================
     35. PAGE TRANSITION RESET
     ======================================================= */

  const resetPageTransition = () => {
    const panel =
      $(
        ".page-transition__panel"
      );


    if (!panel) {
      return;
    }


    if (hasGSAP()) {
      window.gsap.killTweensOf(
        panel
      );


      window.gsap.set(
        panel,
        {
          yPercent: 100
        }
      );


      return;
    }


    panel.style.transform =
      "translateY(100%)";
  };


  /* =======================================================
     36. PAGE TRANSITION
     ======================================================= */

  const transitionToPage = (
    destination
  ) => {
    if (
      state.navigationLocked
    ) {
      return;
    }


    state.navigationLocked =
      true;


    const panel =
      $(
        ".page-transition__panel"
      );


    /*
     Fallback.
    */

    if (
      !panel ||
      !hasGSAP() ||
      state.reducedMotion
    ) {
      window.location.href =
        destination;

      return;
    }


    if (
      state.lenis &&
      typeof state.lenis.stop ===
        "function"
    ) {
      state.lenis.stop();
    }


    window.gsap.killTweensOf(
      panel
    );


    window.gsap.set(
      panel,
      {
        yPercent: 100
      }
    );


    window.gsap.to(
      panel,
      {
        yPercent: 0,

        duration: 0.56,

        ease:
          "power4.inOut",

        onComplete() {
          window.location.href =
            destination;
        }
      }
    );


    /*
     Safety unlock in case navigation
     is prevented by the browser.
    */

    window.setTimeout(
      () => {
        state.navigationLocked =
          false;
      },
      2200
    );
  };


  /* =======================================================
     37. HEADER OFFSET
     ======================================================= */

  const getHeaderOffset = () => {
    const header =
      $(".site-header");


    if (!header) {
      return 18;
    }


    return (
      header.getBoundingClientRect()
        .height + 16
    );
  };


  /* =======================================================
     38. SMOOTH SCROLL
     ======================================================= */

  const scrollToElement = (
    target,
    options = {}
  ) => {
    if (!target) {
      return;
    }


    const offset =
      typeof options.offset ===
        "number"
        ? options.offset
        : -getHeaderOffset();


    if (
      state.lenis &&
      typeof state.lenis.scrollTo ===
        "function"
    ) {
      state.lenis.scrollTo(
        target,
        {
          offset,

          duration:
            state.reducedMotion
              ? 0
              : 1.02
        }
      );


      return;
    }


    const destination =
      target.getBoundingClientRect()
        .top +
      window.scrollY +
      offset;


    window.scrollTo({
      top: destination,

      behavior:
        state.reducedMotion
          ? "auto"
          : "smooth"
    });
  };


  /* =======================================================
     39. HASH TARGET
     ======================================================= */

  const getHashTarget = (
    hash
  ) => {
    if (
      !hash ||
      hash === "#"
    ) {
      return null;
    }


    const id =
      safeDecode(
        hash.replace(
          /^#/,
          ""
        )
      );


    if (!id) {
      return null;
    }


    return document.getElementById(
      id
    );
  };


  /* =======================================================
     40. INTERNAL NAVIGATION
     ======================================================= */

  const initLinkNavigation = () => {
    document.addEventListener(
      "click",
      (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }


        const link =
          event.target.closest("a");


        if (!link) {
          return;
        }


        if (
          link.hasAttribute(
            "data-no-transition"
          )
        ) {
          return;
        }


        if (
          link.target === "_blank" ||
          link.hasAttribute(
            "download"
          )
        ) {
          return;
        }


        const href =
          link.getAttribute(
            "href"
          );


        if (
          !href ||
          href === "#" ||
          href.startsWith(
            "javascript:"
          )
        ) {
          return;
        }


        if (
          href.startsWith(
            "mailto:"
          )
        ) {
          return;
        }


        let url;


        try {
          url =
            new URL(
              link.href,
              window.location.href
            );
        } catch (_) {
          return;
        }


        /*
         External website.
        */

        if (
          url.origin !==
          window.location.origin
        ) {
          return;
        }


        /*
         Same page + hash.
        */

        if (
          isSamePage(url) &&
          url.hash
        ) {
          const target =
            getHashTarget(
              url.hash
            );


          if (!target) {
            return;
          }


          event.preventDefault();


          if (
            state.menuOpen &&
            window.PrivoraMenu
          ) {
            window.PrivoraMenu.close();
          }


          scrollToElement(
            target
          );


          try {
            history.pushState(
              null,
              "",
              url.hash
            );
          } catch (_) {
            /* no-op */
          }


          return;
        }


        /*
         Same exact page with no hash.
         Let browser behaviour stand if needed.
        */

        if (
          isSamePage(url) &&
          !url.hash
        ) {
          if (
            window.scrollY > 10
          ) {
            event.preventDefault();


            if (
              state.lenis
            ) {
              state.lenis.scrollTo(
                0,
                {
                  duration:
                    state.reducedMotion
                      ? 0
                      : 1
                }
              );
            } else {
              window.scrollTo({
                top: 0,

                behavior:
                  state.reducedMotion
                    ? "auto"
                    : "smooth"
              });
            }
          }


          return;
        }


        /*
         Another page in this project.
        */

        event.preventDefault();


        transitionToPage(
          url.href
        );
      }
    );
  };


  /* =======================================================
     41. INITIAL HASH
     ======================================================= */

  const initInitialHash = () => {
    if (
      !window.location.hash
    ) {
      return;
    }


    const target =
      getHashTarget(
        window.location.hash
      );


    if (!target) {
      return;
    }


    const execute = () => {
      window.setTimeout(
        () => {
          scrollToElement(
            target
          );
        },
        60
      );
    };


    if (
      state.loaderHidden
    ) {
      execute();

      return;
    }


    window.addEventListener(
      "privora:loader-hidden",
      execute,
      {
        once: true
      }
    );
  };


  /* =======================================================
     42. HOME NAV SPY
     ======================================================= */

  const initHomeNavSpy = () => {
    if (
      getPageKey() !== "home" ||
      typeof IntersectionObserver ===
        "undefined"
    ) {
      return;
    }


    const sections = [
      {
        element:
          document.getElementById(
            "about"
          ),

        key: "about"
      },

      {
        element:
          document.getElementById(
            "services"
          ),

        key: null
      },

      {
        element:
          document.getElementById(
            "contact"
          ),

        key: "contact"
      }
    ].filter(
      (item) =>
        Boolean(item.element)
    );


    if (!sections.length) {
      return;
    }


    const activate = (
      key
    ) => {
      clearActiveNavigation();


      if (!key) {
        return;
      }


      $$(
        `[data-nav-key="${key}"]`
      ).forEach((link) => {
        link.classList.add(
          "is-active"
        );
      });
    };


    const observer =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              )[0];


          if (!visible) {
            return;
          }


          const section =
            sections.find(
              (item) =>
                item.element ===
                visible.target
            );


          if (section) {
            activate(
              section.key
            );
          }
        },
        {
          threshold: [
            0.2,
            0.4,
            0.6
          ],

          rootMargin:
            "-18% 0px -55% 0px"
        }
      );


    sections.forEach(
      (item) => {
        observer.observe(
          item.element
        );
      }
    );


    /*
     Restore Home near top.
    */

    window.addEventListener(
      "scroll",
      () => {
        if (
          window.scrollY > 130
        ) {
          return;
        }


        activate("home");
      },
      {
        passive: true
      }
    );
  };


  /* =======================================================
     43. BACK TO TOP
     ======================================================= */

  const initBackToTop = () => {
    const button =
      $(".back-to-top");


    if (!button) {
      return;
    }


    let ticking = false;


    const update = () => {
      button.classList.toggle(
        "is-visible",
        window.scrollY > 600
      );


      ticking = false;
    };


    window.addEventListener(
      "scroll",
      () => {
        if (ticking) {
          return;
        }


        ticking = true;


        window.requestAnimationFrame(
          update
        );
      },
      {
        passive: true
      }
    );


    button.addEventListener(
      "click",
      () => {
        if (
          state.lenis &&
          typeof state.lenis.scrollTo ===
            "function"
        ) {
          state.lenis.scrollTo(
            0,
            {
              duration:
                state.reducedMotion
                  ? 0
                  : 0.95
            }
          );


          return;
        }


        window.scrollTo({
          top: 0,

          behavior:
            state.reducedMotion
              ? "auto"
              : "smooth"
        });
      }
    );


    update();
  };


  /* =======================================================
     44. GENERIC HOVER REVEAL
     -------------------------------------------------------
     Optional use:

     data-hover-image="assets/images/example.webp"

     This is separate from the special Case Study
     interaction in index.js.
     ======================================================= */

  const initHoverReveal = () => {
    if (
      !state.finePointer ||
      state.reducedMotion
    ) {
      return;
    }


    const triggers =
      $$(
        "[data-hover-image]"
      );


    if (!triggers.length) {
      return;
    }


    let reveal =
      $(".hover-reveal");


    if (!reveal) {
      reveal =
        document.createElement(
          "div"
        );


      reveal.className =
        "hover-reveal";


      reveal.setAttribute(
        "aria-hidden",
        "true"
      );


      const image =
        document.createElement(
          "img"
        );


      image.alt = "";


      reveal.appendChild(
        image
      );


      document.body.appendChild(
        reveal
      );
    }


    const image =
      $("img", reveal);


    if (!image) {
      return;
    }


    let targetX = -300;
    let targetY = -300;

    let currentX = targetX;
    let currentY = targetY;

    let running = false;


    const render = () => {
      if (!running) {
        return;
      }


      currentX +=
        (
          targetX -
          currentX
        ) * 0.17;


      currentY +=
        (
          targetY -
          currentY
        ) * 0.17;


      reveal.style.left =
        `${currentX}px`;


      reveal.style.top =
        `${currentY}px`;


      window.requestAnimationFrame(
        render
      );
    };


    triggers.forEach(
      (trigger) => {
        trigger.addEventListener(
          "pointerenter",
          (event) => {
            const src =
              trigger.dataset
                .hoverImage;


            if (!src) {
              return;
            }


            image.src =
              resolveSitePath(src);


            targetX =
              currentX =
                event.clientX;


            targetY =
              currentY =
                event.clientY;


            reveal.classList.add(
              "is-visible"
            );


            if (!running) {
              running = true;

              window.requestAnimationFrame(
                render
              );
            }
          }
        );


        trigger.addEventListener(
          "pointermove",
          (event) => {
            targetX =
              event.clientX;

            targetY =
              event.clientY;
          }
        );


        trigger.addEventListener(
          "pointerleave",
          () => {
            reveal.classList.remove(
              "is-visible"
            );
          }
        );
      }
    );
  };


  /* =======================================================
     45. CUSTOM CURSOR
     ======================================================= */

  const initCustomCursor = () => {
    const cursor =
      $(".custom-cursor");


    if (
      !cursor ||
      !state.finePointer ||
      state.reducedMotion
    ) {
      return;
    }


    let targetX = -100;
    let targetY = -100;

    let currentX = targetX;
    let currentY = targetY;


    const render = () => {
      currentX +=
        (
          targetX -
          currentX
        ) * 0.24;


      currentY +=
        (
          targetY -
          currentY
        ) * 0.24;


      cursor.style.left =
        `${currentX}px`;


      cursor.style.top =
        `${currentY}px`;


      window.requestAnimationFrame(
        render
      );
    };


    document.addEventListener(
      "pointermove",
      (event) => {
        targetX =
          event.clientX;

        targetY =
          event.clientY;
      },
      {
        passive: true
      }
    );


    document.addEventListener(
      "pointerover",
      (event) => {
        const interactive =
          event.target.closest(
            [
              "a",
              "button",
              "input",
              "textarea",
              "select",
              ".swiper-slide",
              ".accordion-button",
              ".service-hover-row",
              ".service-resource-row",
              "[data-hover-image]"
            ].join(",")
          );


        cursor.classList.toggle(
          "is-active",
          Boolean(interactive)
        );
      }
    );


    window.requestAnimationFrame(
      render
    );
  };


  /* =======================================================
     46. REFRESH LAYOUT
     ======================================================= */

  function refreshLayout() {
    if (
      state.lenis &&
      typeof state.lenis.resize ===
        "function"
    ) {
      try {
        state.lenis.resize();
      } catch (_) {
        /* no-op */
      }
    }


    if (
      hasScrollTrigger()
    ) {
      try {
        window.ScrollTrigger.refresh();
      } catch (_) {
        /* no-op */
      }
    }


    if (hasAOS()) {
      try {
        window.AOS.refresh();
      } catch (_) {
        /* no-op */
      }
    }


    if (
      window.PrivoraHome &&
      typeof window.PrivoraHome
        .refresh ===
        "function"
    ) {
      try {
        window.PrivoraHome
          .refresh();
      } catch (_) {
        /* no-op */
      }
    }


    if (
      window.PrivoraService &&
      typeof window.PrivoraService
        .refresh ===
        "function"
    ) {
      try {
        window.PrivoraService
          .refresh();
      } catch (_) {
        /* no-op */
      }
    }
  }


  /* =======================================================
     47. IMAGE REFRESH
     ======================================================= */

  const initImageRefresh = () => {
    const images =
      $$("img");


    let waiting = 0;


    images.forEach((image) => {
      if (image.complete) {
        return;
      }


      waiting += 1;


      const complete = () => {
        waiting -= 1;


        if (
          waiting <= 0
        ) {
          window.requestAnimationFrame(
            refreshLayout
          );
        }
      };


      image.addEventListener(
        "load",
        complete,
        {
          once: true
        }
      );


      image.addEventListener(
        "error",
        complete,
        {
          once: true
        }
      );
    });
  };


  /* =======================================================
     48. RESIZE REFRESH
     ======================================================= */

  const initResizeRefresh = () => {
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(
          state.resizeTimer
        );


        state.resizeTimer =
          window.setTimeout(
            refreshLayout,
            180
          );
      },
      {
        passive: true
      }
    );
  };


  /* =======================================================
     49. BF CACHE / BACK BUTTON
     ======================================================= */

  const initPageRestore = () => {
    window.addEventListener(
      "pageshow",
      (event) => {
        resetPageTransition();


        state.navigationLocked =
          false;


        if (!event.persisted) {
          return;
        }


        const loader =
          $(".page-loader");


        if (loader) {
          loader.classList.add(
            "is-hidden"
          );


          loader.setAttribute(
            "aria-hidden",
            "true"
          );
        }


        document.body.classList.remove(
          "is-loading",
          "menu-open"
        );


        state.loaderHidden =
          true;


        state.menuOpen =
          false;


        const toggle =
          $(".menu-toggle");


        const menu =
          $(".mobile-menu");


        toggle?.classList.remove(
          "is-active"
        );


        toggle?.setAttribute(
          "aria-expanded",
          "false"
        );


        menu?.classList.remove(
          "is-open"
        );


        menu?.setAttribute(
          "aria-hidden",
          "true"
        );


        if (
          state.lenis &&
          typeof state.lenis.start ===
            "function"
        ) {
          state.lenis.start();
        }


        window.setTimeout(
          refreshLayout,
          70
        );
      }
    );
  };


  /* =======================================================
     50. WINDOW LOAD REFRESH
     ======================================================= */

  const initLoadRefresh = () => {
    window.addEventListener(
      "load",
      () => {
        window.requestAnimationFrame(
          refreshLayout
        );
      },
      {
        once: true
      }
    );
  };


  /* =======================================================
     51. GLOBAL INITIALIZATION
     ======================================================= */

  const init = () => {
    if (
      state.initialized
    ) {
      return;
    }


    state.initialized =
      true;


    /*
     CONFIG FIRST.
    */

    applyConfig();


    /*
     Libraries.
    */

    registerGSAP();

    initLenis();

    initAOS();


    /*
     UI.
    */

    initHeader();

    initMobileMenu();

    initAccordions();

    initCookieConsent();

    initContactForms();

    initBackToTop();

    initHoverReveal();

    initCustomCursor();


    /*
     Navigation.
    */

    resetPageTransition();

    initLinkNavigation();

    initHomeNavSpy();


    /*
     Browser lifecycle.
    */

    initPageRestore();

    initResizeRefresh();

    initImageRefresh();

    initLoadRefresh();


    /*
     Loader near end so home/service scripts
     already have listeners ready.
    */

    initLoader();

    initInitialHash();


    window.dispatchEvent(
      new CustomEvent(
        "privora:ready",
        {
          detail: {
            config,
            root:
              SITE_ROOT.href
          }
        }
      )
    );
  };


  /* =======================================================
     52. PUBLIC API
     ======================================================= */

  window.PrivoraSite = {
    init,

    state,

    config,

    root:
      SITE_ROOT.href,

    resolvePath:
      resolveSitePath,

    formatTemplate,

    getPageKey,

    applyConfig,

    refresh:
      refreshLayout,

    scrollTo:
      scrollToElement,

    navigate:
      transitionToPage
  };


  /* =======================================================
     53. START
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
