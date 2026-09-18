# Eco-Rewards Spring Boot Microservice 🍃

High-performance Spring Boot 3.x REST microservice for managing eco-incentives, real-world utility bill rebates, green transit credits, and reward redemptions.

## Architecture
- **Framework**: Spring Boot 3.2.3
- **Java Version**: Java 21 LTS
- **Port**: 8085
- **Endpoints**:
  - `GET /api/v1/rewards/health` - Health check
  - `GET /api/v1/rewards/catalog` - Dynamic list of all eco rewards (Metro, EV, Trees, Plastic cleanup, Vouchers)
  - `GET /api/v1/rewards/claims/{userId}` - User's redeemed vouchers & certificate history
  - `POST /api/v1/rewards/redeem` - Deduct points, validate inputs, generate secure codes
  - `GET /api/v1/rewards/impact` - Live community environmental impact stats

## How to Run:
```powershell
cd d:\antigravity\eco\eco-rewards-service
mvn spring-boot:run
```
Or if packaging as jar:
```powershell
mvn clean package -DskipTests
java -jar target/eco-rewards-service-1.0.0.jar
```
