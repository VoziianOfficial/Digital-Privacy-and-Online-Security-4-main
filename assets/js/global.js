
































(() => {
  "use strict";


  



  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");


  



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

    coarsePointer: window.matchMedia(
      "(hover: none), (pointer: coarse)"
    ).matches,

    lenis: null,

    lenisTickerConnected: false,

    resizeTimer: null,

    refreshTimer: null,

    refreshFrame: null,

    refreshQueued: false,

    refreshRunning: false,

    scrollLockedByMenu: false
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


  const hasLenis = () =>
    typeof window.Lenis !== "undefined";


  const hasAOS = () =>
    typeof window.AOS !== "undefined";


  const canUseAOS = () =>
    hasAOS() &&
    Boolean(
      document.querySelector("[data-aos]")
    );


  const canUseLenis = () =>
    state.finePointer &&
    !state.coarsePointer;


  const safeDecode = (value) => {
    try {
      return decodeURIComponent(value);
    } catch (_) {
      return value;
    }
  };


  





















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
      
    }

    return new URL(
      "./",
      window.location.href
    );
  })();


  



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


  



  const applyMetaDescription = () => {
    const pageKey =
      getPageKey();


    const descriptions =
      config.pageDescriptions || {};


    const rawDescription =
      descriptions[pageKey] ||
      (!document.querySelector(
        'meta[name="description"]'
      )
        ? config.metaDescription
        : "");


    if (!rawDescription) {
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
        rawDescription
      );
  };


  



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


  



  const registerGSAP = () => {
    if (
      hasGSAP() &&
      hasScrollTrigger()
    ) {
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
  };


  



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


  



  const initLenis = () => {
    if (
      state.reducedMotion ||
      !canUseLenis() ||
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


  








  const initAOS = () => {
    if (!canUseAOS()) {
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
      
    }
  };


  const storageRemove = (
    key
  ) => {
    try {
      window.localStorage
        .removeItem(key);
    } catch (_) {
      
    }
  };


  



  const COOKIE_KEY =
    config.cookiePreferenceKey ||
    "site_cookie_preference_v1";


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


    



    window.setTimeout(
      hide,
      3500
    );
  };


  



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


    




    window.setTimeout(
      () => {
        state.navigationLocked =
          false;
      },
      2200
    );
  };


  



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


        



        if (
          url.origin !==
          window.location.origin
        ) {
          return;
        }


        



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
            
          }


          return;
        }


        




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


        



        event.preventDefault();


        transitionToPage(
          url.href
        );
      }
    );
  };


  



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


  



  function refreshLayout() {
    state.refreshQueued =
      false;

    state.refreshFrame =
      null;

    state.refreshRunning =
      true;

    if (
      state.lenis &&
      typeof state.lenis.resize ===
        "function"
    ) {
      try {
        state.lenis.resize();
      } catch (_) {
        
      }
    }


    if (
      window.PrivoraHome &&
      typeof window.PrivoraHome
        .updateLayout ===
        "function"
    ) {
      try {
        window.PrivoraHome
          .updateLayout();
      } catch (_) {
        
      }
    }


    if (
      hasScrollTrigger()
    ) {
      try {
        window.ScrollTrigger.refresh();
      } catch (_) {
        
      }
    }


    if (canUseAOS()) {
      try {
        window.AOS.refresh();
      } catch (_) {
        
      }
    }


    state.refreshRunning =
      false;
  }


  const requestRefresh = (
    delay = 80
  ) => {
    if (
      state.refreshRunning ||
      state.refreshFrame
    ) {
      state.refreshQueued =
        true;

      return;
    }

    if (
      state.refreshTimer
    ) {
      window.clearTimeout(
        state.refreshTimer
      );
    }


    state.refreshQueued =
      true;


    state.refreshTimer =
      window.setTimeout(
        () => {
          state.refreshTimer =
            null;


          if (
            state.refreshFrame
          ) {
            return;
          }


          state.refreshFrame =
            window.requestAnimationFrame(
              refreshLayout
            );
        },
        delay
      );
  };


  



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
          requestRefresh();
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


  



  const initResizeRefresh = () => {
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(
          state.resizeTimer
        );


        state.resizeTimer =
          window.setTimeout(
            requestRefresh,
            180
          );
      },
      {
        passive: true
      }
    );
  };


  



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
          requestRefresh,
          70
        );
      }
    );
  };


  



  const initLoadRefresh = () => {
    window.addEventListener(
      "load",
      () => {
        requestRefresh();
      },
      {
        once: true
      }
    );
  };


  



  const init = () => {
    if (
      state.initialized
    ) {
      return;
    }


    state.initialized =
      true;


    



    applyConfig();


    



    registerGSAP();

    initLenis();

    initAOS();


    



    initHeader();

    initMobileMenu();

    initAccordions();

    initCookieConsent();

    initContactForms();

    initBackToTop();

    initHoverReveal();

    initCustomCursor();


    



    resetPageTransition();

    initLinkNavigation();

    initHomeNavSpy();


    



    initPageRestore();

    initResizeRefresh();

    initImageRefresh();

    initLoadRefresh();


    




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
      requestRefresh,

    refreshNow:
      refreshLayout,

    scrollTo:
      scrollToElement,

    navigate:
      transitionToPage
  };


  window.PrivoraRefresh = {
    request:
      requestRefresh,

    now:
      refreshLayout
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
