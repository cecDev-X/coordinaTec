# Etapa 1: Construcción de React usando Node
FROM node:20-alpine AS build
WORKDIR /app
ARG PORTAL_MODE=local
COPY package*.json ./
RUN npm ci
COPY . .
RUN if [ "$PORTAL_MODE" = "student" ] || [ "$PORTAL_MODE" = "admin" ]; then npm run build -- --mode "$PORTAL_MODE"; else npm run build; fi

# Etapa 2: Servidor NGINX ligero para producción
FROM nginx:alpine
# Tomamos los archivos estáticos compilados de Vite y los pasamos a NGINX
COPY --from=build /app/dist /usr/share/nginx/html
ARG PORTAL_MODE=local
COPY nginx.conf /etc/nginx/conf.d/local.conf
COPY nginx.student.conf /etc/nginx/conf.d/student.conf
COPY nginx.admin.conf /etc/nginx/conf.d/admin.conf
RUN case "$PORTAL_MODE" in \
  student) mv /etc/nginx/conf.d/student.conf /etc/nginx/conf.d/default.conf ;; \
  admin) mv /etc/nginx/conf.d/admin.conf /etc/nginx/conf.d/default.conf ;; \
  *) mv /etc/nginx/conf.d/local.conf /etc/nginx/conf.d/default.conf ;; \
  esac && rm -f /etc/nginx/conf.d/local.conf /etc/nginx/conf.d/student.conf /etc/nginx/conf.d/admin.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
