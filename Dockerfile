FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 8004

CMD ["node", "index.js"]
