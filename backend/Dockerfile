# Etapa 1: Construcción (Descarga dependencias y compila el .jar)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Copiamos el archivo de dependencias primero para optimizar la caché de Docker
COPY pom.xml .
RUN mvn dependency:go-offline
# Copiamos el código fuente y compilamos omitiendo pruebas para arrancar rápido
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución (Crea un contenedor ligero solo con la máquina virtual de Java 21)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Jalamos el archivo compilado de la Etapa 1
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]