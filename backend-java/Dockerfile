FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml /workspace/pom.xml
COPY .mvn /workspace/.mvn
COPY mvnw /workspace/mvnw
RUN chmod +x /workspace/mvnw
RUN ./mvnw -q -B -DskipTests dependency:go-offline
COPY src /workspace/src
RUN ./mvnw -q -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/*.jar /app/app.jar
ENV JAVA_OPTS=""
EXPOSE 8080
CMD ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
