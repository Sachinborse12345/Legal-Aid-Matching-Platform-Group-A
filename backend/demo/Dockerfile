# # Use Java 17
# FROM eclipse-temurin:17-jdk

# # Set working directory
# WORKDIR /app

# # Copy project files
# COPY . .

# # Build the project
# RUN ./mvnw clean package

# # Run the jar
# CMD ["java", "-jar", "target/*.jar"]

# Use Java 17
FROM eclipse-temurin:17-jdk-jammy

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Give permission to mvnw
RUN chmod +x mvnw

# Build app
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run app
CMD ["java", "-jar", "target/demo-0.0.1-SNAPSHOT.jar"]
