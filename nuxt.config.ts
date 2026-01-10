// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  typescript: {
    typeCheck: true,
    strict: true,
  },
  routeRules: {
    '/': { redirect: { to: '/dashboard', statusCode: 301 } },
  },
  runtimeConfig: {
    secret: '',
    pes: {
      url: '',
      apiToken: '',
    },
    pascom: {
      connector: {
        username: '',
        password: '',
      },
    },
    gotenberg: {
      url: '',
      username: '',
      password: '',
    },
    bullmq: {
      sysname: 'wodaniobos',
    },
    redis: {
      url: 'redis://localhost:6379/0'
    },
    openId: {
      issuer: '',
      clientId: '',
      clientSecret: '',
      allowAutoCreate: true,
    },
    listmonk: {
      url: '',
      importListIds: '',
    },
    public: {
      siteUrl: 'http://localhost:3000',
      siteTitle: 'Wodanio Business Operation System',
      logoUrl: 'https://de-zlg1.s3.wodanio.net/cdn/wodanio/logo/bos-logo.svg',
      local: 'en',
    },
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  css: [
    './css/fonts.css',
    'lucide-static/font/lucide.css',
  ],
  umami: {
    id: '4ffdd1cc-169b-406f-8310-ecb0aa7c2c12',
    host: 'https://analytics.apps.wodanio.com',
    autoTrack: true,
    enabled: true,
    useDirective: true,
    ignoreLocalhost: true,
  },
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.yml' },
      { code: 'de', language: 'de-DE', file: 'de.yml' },
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
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
  modules: [
    '@nuxt/image',
    'nuxt-umami',
    '@nuxtjs/tailwindcss',
    'reka-ui/nuxt',
    '@nuxtjs/i18n',
    'nuxt-charts',
  ]
})