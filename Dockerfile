FROM node:14

WORKDIR /code
COPY . $WORKDIR

# install pm2 to keep the container running
RUN npm install pm2 -g

CMD ["pm2", "index.js", "--no-daemon"]