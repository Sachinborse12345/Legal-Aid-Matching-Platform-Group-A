# ---------- Build Stage ----------
    FROM node:18 AS build

    WORKDIR /app
    
    # copy frontend package files
    COPY frontend/package*.json ./
    
    RUN npm install
    
    # copy frontend source
    COPY frontend .
    
    RUN npm run build
    
    
    # ---------- Production Stage ----------
    FROM nginx:alpine
    
    COPY --from=build /app/dist /usr/share/nginx/html
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    