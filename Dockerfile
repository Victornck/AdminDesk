# ---------- Build do Frontend ----------
FROM node:20 AS frontend-build
WORKDIR /app

COPY admindesk-front ./admindesk-front

WORKDIR /app/admindesk-front
RUN npm install
RUN npm run build


# ---------- Build do Backend ----------
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
WORKDIR /app

COPY . .

# Copia build do React para Spring Boot
COPY --from=frontend-build /app/admindesk-front/dist /app/src/main/resources/static

RUN mvn clean package -DskipTests


# ---------- Container Final ----------
FROM eclipse-temurin:21
WORKDIR /app

COPY --from=backend-build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]