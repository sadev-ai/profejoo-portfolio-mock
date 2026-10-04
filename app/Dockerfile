FROM node:20-alpine AS builder
WORKDIR /app
ARG NPM_REGISTRY=https://registry.npmjs.org
RUN npm config set registry $NPM_REGISTRY
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_MOCK_MODE=true
ARG VITE_DEFAULT_API_BASE_URL=http://demo.local
ENV VITE_MOCK_MODE=$VITE_MOCK_MODE
ENV VITE_DEFAULT_API_BASE_URL=$VITE_DEFAULT_API_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
