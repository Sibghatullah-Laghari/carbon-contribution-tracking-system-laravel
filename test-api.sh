#!/bin/bash
# Start the application
cd "D:\SDA Project\carbon-contribution-tracking-system\backend\cctrs-backend"
java -jar target/backend-0.0.1-SNAPSHOT.jar &
sleep 10

# Test endpoints
echo "Testing GET /api/users"
curl -X GET http://localhost:8080/api/users -H "Content-Type: application/json"

echo ""
echo "Testing POST /api/users"
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","username":"testuser","role":"USER"}'

echo ""
echo "All tests completed"
