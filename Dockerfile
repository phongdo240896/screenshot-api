FROM mcr.microsoft.com/playwright:v1.41.2-jammy

WORKDIR /app
COPY . .

RUN npm install

EXPOSE 10000
CMD ["npm", "start"]
