FROM node:24-alpine

WORKDIR /app

COPY . .

RUN npm install \
  && NITRO_PRESET=node-server npm run build
  
RUN rm -rf ./app ./lib ./public ./server ./shared

ENV NODE_ENV=production

CMD [ "sh", "-c", "npm run db:migrate && node --trace-warnings /app/main.js" ]
