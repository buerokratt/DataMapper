FROM node:19

ENV NODE_ENV development
WORKDIR /workspace/app/

COPY js js
COPY views views
COPY package.json .
COPY server.js .

# Rename all .hbs files in views directory to .handlebars so Handlebars can read them.
RUN for f in `find views -iname '*.hbs' -type f -print`; do mv "$f" ${f%.hbs}.handlebars; done

RUN npm i -g npm@latest
RUN npm install
ENTRYPOINT ["npm","start"]