# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
COPY micronaut-cli.yml .
RUN mvn -q -DskipTests package

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/demo1-0.1.jar /app/app.jar
# Micronaut runs on 8080
EXPOSE 8080
# Allow overriding DB via env
ENV DATASOURCES_DEFAULT_URL=jdbc:postgresql://db:5432/vexlconverter \
    DATASOURCES_DEFAULT_USERNAME=postgres \
    DATASOURCES_DEFAULT_PASSWORD=postgres \
    DATASOURCES_DEFAULT_DIALECT=POSTGRES \
    MICRONAUT_SERVER_PORT=8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
