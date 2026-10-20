# Etapa 1: Construcción de React usando Node
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor NGINX ligero para producción
FROM nginx:alpine
# Tomamos los archivos estáticos compilados de Vite y los pasamos a NGINX
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]