# Millionaires Club - Backend API

Node.js + Express + PostgreSQL backend for the Millionaires Club Fund CRM.

## 🚀 Quick Start

### 1. Install PostgreSQL

**Option A: Docker (Recommended)**
```bash
docker run --name millionaires-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=millionaires_club \
  -p 5432:5432 \
  -d postgres:15
```

**Option B: Local Installation**
- Mac: `brew install postgresql@15`
- Windows: Download from postgresql.org
- Linux: `sudo apt-get install postgresql`

### 2. Setup Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Run schema
\i database/schema.sql
```

Or using command line:
```bash
psql -U postgres -d millionaires_club -f database/schema.sql
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 5. Run Development Server

```bash
npm run dev
```

Server will start on http://localhost:5000

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "member",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "member"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Members

#### Get All Members (Admin)
```http
GET /api/members
Authorization: Bearer {admin_token}
```

#### Get Member by ID
```http
GET /api/members/:id
Authorization: Bearer {token}
```

#### Create Member (Admin)
```http
POST /api/members
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-0001",
  "address": "123 Main St",
  "join_date": "2024-01-15"
}
```

#### Update Member
```http
PUT /api/members/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "phone": "555-9999",
  "address": "456 Oak Ave"
}
```

### Loans

#### Get All Loans (Admin)
```http
GET /api/loans
Authorization: Bearer {admin_token}
```

#### Create Loan (Admin)
```http
POST /api/loans
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "borrower_id": "uuid",
  "cosigner_id": "uuid",
  "original_amount": 5000,
  "term_months": 12,
  "start_date": "2024-01-01"
}
```

#### Record Payment (Admin)
```http
POST /api/loans/:id/repay
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "amount": 500,
  "payment_method": "Cash",
  "received_by": "Admin"
}
```

### Transactions

#### Get All Transactions (Admin)
```http
GET /api/transactions
Authorization: Bearer {admin_token}
```

#### Create Transaction (Admin)
```http
POST /api/transactions
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "member_id": "uuid",
  "type": "CONTRIBUTION",
  "amount": 100,
  "description": "Monthly contribution",
  "payment_method": "Cash",
  "received_by": "Treasurer"
}
```

### Contributions

#### Get All Contributions (Admin)
```http
GET /api/contributions
Authorization: Bearer {admin_token}
```

#### Record Contribution (Admin)
```http
POST /api/contributions
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "member_id": "uuid",
  "year": 2024,
  "amount": 1200,
  "paid": true,
  "paid_date": "2024-01-15"
}
```

## 🧪 Testing

```bash
# Test database connection
npm run dev

# Check health endpoint
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@millionairesclub.com","password":"admin123"}'
```

## 🚢 Deployment

### Option 1: Render.com (Easiest)

1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect repository
4. Configure:
   - Build: `npm install && npm run build`
   - Start: `npm start`
5. Add environment variables
6. Create PostgreSQL database on Render

### Option 2: Railway

1. Connect GitHub repo
2. Add PostgreSQL plugin
3. Deploy automatically

### Option 3: DigitalOcean

1. Create Droplet (Ubuntu)
2. Install Node.js and PostgreSQL
3. Clone repo and build
4. Use PM2 for process management
5. Configure Nginx as reverse proxy

## 🔐 Security Notes

- Change JWT_SECRET in production
- Use HTTPS in production
- Update default admin password
- Enable rate limiting (add express-rate-limit)
- Add input validation (add joi or zod)
- Use environment-specific configs

## 📝 Environment Variables

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=millionaires_club
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## 🛠️ Development

```bash
# Start dev server with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run migrate
```

## 📦 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # PostgreSQL connection
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication
│   ├── routes/
│   │   ├── auth.ts           # Auth endpoints
│   │   ├── members.ts        # Member CRUD
│   │   ├── loans.ts          # Loan management
│   │   ├── transactions.ts   # Transactions
│   │   └── contributions.ts  # Contributions
│   └── server.ts             # Express app setup
├── database/
│   └── schema.sql            # Database schema
├── package.json
├── tsconfig.json
└── .env
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License
