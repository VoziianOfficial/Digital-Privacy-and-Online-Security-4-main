/* =========================================================
   SITE CONFIG
   Digital Privacy & Online Security Aggregator

   Edit this file to update brand information across
   the entire website.
   ========================================================= */

window.SiteConfig = {

  /* -------------------------------------------------------
     BRAND
     ------------------------------------------------------- */

  companyName: "Privora",

  companyShortName: "Privora",

  logo: "assets/icons/logo.svg",

  favicon: "assets/icons/favicon.svg",


  /* -------------------------------------------------------
     CONTACT
     No phone numbers are used anywhere on the website.
     ------------------------------------------------------- */

  email: "hello@privora-security.com",


  /* -------------------------------------------------------
     BROWSER / SEO
     ------------------------------------------------------- */

  browserTitle: "{companyName} | Digital Privacy & Online Security",

  titleSeparator: " | ",

  metaDescription:
    "Independent digital privacy and online security information designed to help users explore privacy protection, safer browsing, account security and online security resources.",


  /* -------------------------------------------------------
     PAGE TITLES

     These values will be used by global.js to create
     the browser-tab title for every page.
     ------------------------------------------------------- */

  pageTitles: {

    home: "{companyName} | Digital Privacy & Online Security",

    privacyProtection:
      "Privacy Protection{titleSeparator}{companyName}",

    onlineSecurity:
      "Online Security{titleSeparator}{companyName}",

    privacy:
      "Privacy Policy{titleSeparator}{companyName}",

    terms:
      "Terms of Use{titleSeparator}{companyName}",

    cookies:
      "Cookie Policy{titleSeparator}{companyName}"

  },


  /* -------------------------------------------------------
     FOOTER DISCLAIMER

     {companyName} will automatically be replaced
     with the companyName value above.
     ------------------------------------------------------- */

  disclaimer:
    "{companyName} is an independent digital privacy and online security information aggregator. We provide general educational resources and help users explore privacy and security-related services. We do not guarantee specific security outcomes, and users should independently verify providers, products, features, pricing, availability and suitability before making a decision.",


  /* -------------------------------------------------------
     GENERAL SITE TEXT
     ------------------------------------------------------- */

  serviceArea:
    "Digital privacy and online security resources",

  availabilityText:
    "Resources and service availability may vary.",


  /* -------------------------------------------------------
     CONTACT FORM
     ------------------------------------------------------- */

  contactForm: {

    endpoint: "contact.php",

    successMessage:
      "Thank you. Your message has been successfully sent.",

    errorMessage:
      "Something went wrong. Please try again.",

    validationMessage:
      "Please complete all required fields."

  },


  /* -------------------------------------------------------
     SERVICES

     Used later for navigation, footer and service links.
     ------------------------------------------------------- */

  services: [

    {
      name: "Privacy Protection",
      shortName: "Privacy",
      url: "services/privacy-protection.html"
    },

    {
      name: "Online Security",
      shortName: "Security",
      url: "services/online-security.html"
    }

  ],


  /* -------------------------------------------------------
     NAVIGATION
     ------------------------------------------------------- */

  navigation: {

    home: "index.html",

    about: "index.html#about",

    contact: "index.html#contact",

    privacy: "privacy.html",

    terms: "terms.html",

    cookies: "cookies.html"

  },


  /* -------------------------------------------------------
     SOCIAL / TELEPHONE

     Intentionally not included.
     This project must contain NO phone numbers.
     ------------------------------------------------------- */

  phone: null

};
