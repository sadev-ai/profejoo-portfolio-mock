FROM node:20-alpine AS builder
WORKDIR /app
ARG NPM_REGISTRY=https://registry.npmjs.org
RUN npm config set registry $NPM_REGISTRY && npm install -g pnpm@10.20.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm config set registry $NPM_REGISTRY && pnpm install --frozen-lockfile
COPY . .
ARG PUBLIC_APP_URL=http://localhost:8090
ENV PUBLIC_APP_URL=$PUBLIC_APP_URL
RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
