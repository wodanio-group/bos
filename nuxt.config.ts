// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  typescript: {
    typeCheck: true,
    strict: true,
  },
  nitro: {
    experimental: {
      openAPI: true
    },
    openAPI: {
      meta: {
        title: 'WodanioCRM'
      },
    },
  },
  runtimeConfig: {
    secret: '',
    openId: {
      issuer: '',
      clientId: '',
      clientSecret: '',
      allowAutoCreate: 'true',
    },
    public: {
      siteUrl: 'http://localhost:3000',
    },
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no',
      htmlAttrs: {
        lang: 'de',
      },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      ],
    },
  },
  css: [
    '@fortawesome/fontawesome-free/css/all.css',
  ],
  umami: {
    id: '4ffdd1cc-169b-406f-8310-ecb0aa7c2c12',
    host: 'https://analytics.apps.wodanio.com',
    autoTrack: true,
    enabled: true,
    useDirective: true,
    ignoreLocalhost: true,
  },
  sitemap: {
    autoLastmod: true,
  },
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
    config: {
      theme: {
        extend: {
        },
      },
      plugins: [
        require('@tailwindcss/forms')
      ],
    },
  },
  vite: {
    resolve: {
      alias: {
        '.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js',
      },
    },
  },
  modules: ['@nuxt/image', '@prisma/nuxt', '@prisma/nuxt', '@nuxtjs/sitemap', 'nuxt-umami', '@nuxtjs/tailwindcss']
})