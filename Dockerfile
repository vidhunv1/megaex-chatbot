FROM node:10
EXPOSE 443 443
COPY . /home/t-bot
WORKDIR /home/t-bot

RUN yarn install

CMD yarn serve
