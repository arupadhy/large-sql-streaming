FROM node:14

WORKDIR /code
COPY . $WORKDIR

# install pm2 to keep the container running
# this is not necessary but a quick dirty way
RUN npm install pm2 -g
RUN npm install 

CMD ["pm2", "index.js", "--no-daemon"]
