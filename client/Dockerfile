FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json primero para usar caché
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 5173

# Variable de entorno para desarrollo
ENV VITE_API_URL=http://localhost:5050/api

# Comando para ejecutar en desarrollo
CMD ["npm", "run", "dev", "--", "--host"]