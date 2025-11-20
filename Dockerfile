FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY entrypoint.sh .

COPY . .

RUN npm i -g @nestjs/cli

RUN npm install

RUN chmod +x /app/entrypoint.sh

EXPOSE 3001 5555

ENTRYPOINT [ "/app/entrypoint.sh" ]

CMD ["npm", "run", "start:dev"]
