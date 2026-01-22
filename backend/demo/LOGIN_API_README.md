# Login API Documentation

## Endpoint

**POST** `https://advocare-backend-gkg0.onrender.com/api/auth/login`

## Headers

```
Content-Type: application/json
```

## Request Body Format

```json
{
  "username": "user@example.com",
  "password": "password123",
  "role": "CITIZEN"
}
```

## Request Fields

- `username` (required): User's email address
- `password` (required): User's password
- `role` (required): User role - must be one of: `CITIZEN`, `LAWYER`, `NGO`, `ADMIN`

## Response Format (Success - 200 OK)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "username": "User Full Name",
  "role": "CITIZEN",
  "userId": 1,
  "message": "Login successful",
  "userData": {
    "id": 1,
    "fullName": "User Full Name",
    "aadharNum": "123456789012",
    "email": "user@example.com",
    "mobileNum": "9876543210",
    "dateOfBirth": "1990-01-15",
    "state": "Maharashtra",
    "district": "Pune",
    "city": "Pune",
    "address": "123 Main Street"
  }
}
```

**Note**: The `userData` object contains all user information (excluding password) based on the user's role:

- **CITIZEN**: id, fullName, aadharNum, email, mobileNum, dateOfBirth, state, district, city, address
- **LAWYER**: id, fullName, email, mobileNum, aadharNum, barCouncilId, specialization, address, state, district, city, latitude, longitude, and more
- **NGO**: id, ngoName, ngoType, registrationNumber, contact, email, address, state, district, city, pincode, latitude, longitude, and more
- **ADMIN**: email, username (minimal data)

## Response Format (Error - 401 Unauthorized)

```json
"Invalid email or password"
```

## Response Format (Error - 400 Bad Request)

```json
"Email, password, and role are required"
```

## Testing with cURL

### Citizen Login

```bash
curl -X POST https://advocare-backend-gkg0.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "sachinborse7744@gmail.com",
    "password": "your_password",
    "role": "CITIZEN"
  }'
```

### Lawyer Login

```bash
curl -X POST https://advocare-backend-gkg0.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "lawyer@example.com",
    "password": "lawyer_password",
    "role": "LAWYER"
  }'
```

### NGO Login

```bash
curl -X POST https://advocare-backend-gkg0.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ngo@example.com",
    "password": "ngo_password",
    "role": "NGO"
  }'
```

### Admin Login

```bash
curl -X POST https://advocare-backend-gkg0.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@advocare.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

## Testing with Postman

1. **Method**: POST
2. **URL**: `https://advocare-backend-gkg0.onrender.com/api/auth/login`
3. **Headers**:
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body**: Select "raw" and "JSON", then paste one of the examples from `login-request-examples.json`

## Example Request Bodies

See `login-request-examples.json` for ready-to-use JSON examples.

## Notes

- The `username` field actually expects an email address
- Passwords are stored in plain text in the database (for now)
- Admin credentials are hardcoded: `admin@advocare.com` / `admin123`
- The token returned is a JWT that should be stored and sent in subsequent requests as `Authorization: Bearer <token>`
