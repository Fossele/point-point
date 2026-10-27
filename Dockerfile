FROM node:22 AS Build

ARG VITE_BACKEND_URL=http://localhost:4000/api/v1

ARG VITE_SOCKET_HOST = http://localhost:8000/api/v1/

WORKDIR /build
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build
FROM nginx AS final

WORKDIR /usr/share/nginx/html

COPY --from=build /build/dist .

