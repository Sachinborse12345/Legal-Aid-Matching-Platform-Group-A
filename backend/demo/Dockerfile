FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

# Give execute permission to mvnw
RUN chmod +x mvnw

# Build project
RUN ./mvnw clean package -DskipTests

# Run jar
CMD ["sh", "-c", "java -jar target/*.jar"]
