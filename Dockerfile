FROM node:10
EXPOSE 8443 8443
COPY . /home/t-bot
WORKDIR /home/t-bot
RUN yarn install
RUN yarn db:create
RUN yarn db:migrate
CMD yarn serve
