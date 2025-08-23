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
  routeRules: {
    '/': { redirect: { to: '/dashboard', statusCode: 301 } },
  },
  runtimeConfig: {
    secret: '',
    sevdesk: {
      apiUrl: 'https://my.sevdesk.de/api/v1',
      apiToken: '',
    },
    bullmq: {
      sysname: 'wodaniobos',
    },
    redis: {
      url: ''
    },
    openId: {
      issuer: '',
      clientId: '',
      clientSecret: '',
      allowAutoCreate: true,
    },
    public: {
      siteUrl: 'http://localhost:3000',
      siteTitle: 'Wodanio Business Operation System',
      logoUrl: 'https://de-zlg1.s3.wodanio.net/cdn/wodanio/logo/bos-logo.svg',
    },
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap' },
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
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.yml' },
    ],
    defaultLocale: 'en',
  },
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
    config: {
      theme: {
        fontFamily: {
          'sans': 'Geist, system-ui, sans-serif',
        },
        extend: {
          colors: {
            'primary': {
              '50': '#f1f9fe',
              '100': '#e2f3fc',
              '200': '#c0e5f7',
              '300': '#87d1f2',
              '400': '#48bbe8',
              '500': '#20a2d7',
              '600': '#1283b7',
              '700': '#106894',
              '800': '#11587b',
              '900': '#144a66',
              '950': '#0f354c',
            },
            'secondary': {
              '50': '#f7f7f5',
              '100': '#edece7',
              '200': '#d8d6cb',
              '300': '#c3c0ae',
              '400': '#a9a28e',
              '500': '#988f77',
              '600': '#8b806b',
              '700': '#74695a',
              '800': '#60574c',
              '900': '#4f483f',
              '950': '#292521',
            },
            'gray': {
              '50': '#f5f6f6',
              '100': '#e5e8e8',
              '200': '#cdd3d4',
              '300': '#aab4b6',
              '400': '#808e90',
              '500': '#6b797c',
              '600': '#566164',
              '700': '#4a5254',
              '800': '#414749',
              '900': '#3a3e3f',
              '950': '#242728',
            },
          },
          spacing: {
            'aside-width': '240px',
            'main-width': 'calc(100% - 240px)'
          }
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
  modules: [
    '@nuxt/image',
    '@prisma/nuxt',
    '@prisma/nuxt',
    '@nuxtjs/sitemap',
    'nuxt-umami',
    '@nuxtjs/tailwindcss',
    'reka-ui/nuxt',
    '@nuxtjs/i18n',
    'nuxt-charts',
  ]
})