# ---------- Build do Frontend ----------
FROM node:20-alpine AS frontend-build
WORKDIR /app/admindesk-front

COPY admindesk-front/package.json admindesk-front/package-lock.json ./
RUN npm install

COPY admindesk-front/ .

ARG VITE_API_URL=https://admindesk-8oea.onrender.com
ENV VITE_API_URL=$VITE_API_URL

RUN npx vite build


# ---------- Build do Backend ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS backend-build
WORKDIR /app

# Baixa dependências antes de copiar o código (melhor uso de cache)
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src

# Copia o dist do React para o static do Spring Boot
COPY --from=frontend-build /app/admindesk-front/dist ./src/main/resources/static

RUN mvn clean package -DskipTests -B


# ---------- Container Final ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Usuário não-root por segurança
RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=backend-build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]