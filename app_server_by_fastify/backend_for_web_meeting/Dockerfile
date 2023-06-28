FROM node:14
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8080
#CMD ["fastify", "start", "-w", "-l", "info", "-P", "app.js", "--port", "8080"]
CMD ["node", "server.js"]
