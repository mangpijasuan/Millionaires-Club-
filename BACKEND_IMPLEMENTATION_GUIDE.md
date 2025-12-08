# Backend Implementation Guide - Node.js + PostgreSQL

## Project Structure

```
millionaires-club/
├── frontend/                 # Your existing React app
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # New Node.js API
│   ├── src/
│   │   ├── config/          # Database & app config
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── services/        # Business logic
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── database/
    └── migrations/          # Database schema versions
```

---

## Phase 1: Database Setup (PostgreSQL)

### 1.1 Install PostgreSQL

**Option A: Local Installation**
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql@15`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

**Option B: Docker (Recommended for Development)**
```bash
docker run --name millionaires-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=millionaires_club \
  -p 5432:5432 \
  -d postgres:15
```

**Option C: Cloud Hosting (Production)**
- **Render**: Free tier with 90-day storage
- **Railway**: $5/month
- **DigitalOcean**: $15/month
- **Supabase**: Free tier (PostgreSQL as a service)

### 1.2 Database Schema

```sql
-- Create database
CREATE DATABASE millionaires_club;

-- Users table (Admin and Members)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    join_date DATE NOT NULL,
    account_status VARCHAR(50) DEFAULT 'Active',
    total_contributions DECIMAL(10, 2) DEFAULT 0,
    active_loan_id UUID,
    last_loan_paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Yearly Contributions
CREATE TABLE yearly_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, year)
);

-- Loans table
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID REFERENCES members(id) ON DELETE CASCADE,
    cosigner_id UUID REFERENCES members(id),
    original_amount DECIMAL(10, 2) NOT NULL,
    remaining_balance DECIMAL(10, 2) NOT NULL,
    term_months INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    start_date TIMESTAMP NOT NULL,
    next_payment_due TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP NOT NULL,
    description TEXT,
    payment_method VARCHAR(50),
    received_by VARCHAR(100),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for tracking changes
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    changes JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_status ON members(account_status);
CREATE INDEX idx_loans_borrower ON loans(borrower_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_transactions_member ON transactions(member_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_yearly_contributions_member ON yearly_contributions(member_id);
```

---

## Phase 2: Backend API Setup

### 2.1 Initialize Backend Project

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors dotenv bcrypt jsonwebtoken pg
npm install -D typescript @types/express @types/node @types/cors @types/bcrypt @types/jsonwebtoken ts-node nodemon

# Initialize TypeScript
npx tsc --init
```

### 2.2 TypeScript Configuration

**backend/tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 2.3 Environment Variables

**backend/.env**:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=millionaires_club
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 2.4 Database Connection

**backend/src/config/database.ts**:
```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

export default pool;
```

---

## Phase 3: API Implementation

### 3.1 Authentication Middleware

**backend/src/middleware/auth.ts**:
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

### 3.2 Main Server File

**backend/src/server.ts**:
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import memberRoutes from './routes/members';
import loanRoutes from './routes/loans';
import transactionRoutes from './routes/transactions';
import contributionRoutes from './routes/contributions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/contributions', contributionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### 3.3 Package.json Scripts

**backend/package.json**:
```json
{
  "name": "millionaires-club-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "migrate": "node scripts/migrate.js"
  }
}
```

---

## Phase 4: API Endpoints

### Key Endpoints to Implement:

**Authentication**:
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

**Members**:
- `GET /api/members` - List all members
- `POST /api/members` - Create member
- `GET /api/members/:id` - Get member details
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

**Loans**:
- `GET /api/loans` - List all loans
- `POST /api/loans` - Create loan
- `GET /api/loans/:id` - Get loan details
- `PUT /api/loans/:id` - Update loan
- `POST /api/loans/:id/repay` - Record payment

**Transactions**:
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details

**Contributions**:
- `GET /api/contributions` - List contributions
- `POST /api/contributions` - Record contribution
- `PUT /api/contributions/:id` - Update contribution

---

## Phase 5: Frontend Integration

### 5.1 Create API Service

**frontend/src/services/api.ts**:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  // Members
  async getMembers() {
    return this.request('/members');
  }

  async createMember(member: any) {
    return this.request('/members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  }

  // Loans
  async getLoans() {
    return this.request('/loans');
  }

  async createLoan(loan: any) {
    return this.request('/loans', {
      method: 'POST',
      body: JSON.stringify(loan),
    });
  }

  // Add more methods as needed...
}

export default new ApiService();
```

### 5.2 Update Frontend .env

**frontend/.env.local**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## Phase 6: Deployment

### Option 1: Render (Easiest - Free Tier Available)

**Backend**:
1. Push code to GitHub
2. Go to render.com → New → Web Service
3. Connect GitHub repo
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add environment variables

**Database**:
1. Render → New → PostgreSQL
2. Copy connection string
3. Add to backend environment variables

**Frontend**:
- Keep on GitHub Pages (already set up)
- Update `VITE_API_URL` to Render backend URL

### Option 2: DigitalOcean Droplet

1. Create $6/month droplet (Ubuntu)
2. Install Node.js and PostgreSQL
3. Use PM2 to keep server running
4. Set up Nginx reverse proxy
5. Get SSL certificate (Let's Encrypt)

### Option 3: Railway

1. Connect GitHub repo
2. Auto-deploys on push
3. Add PostgreSQL plugin
4. $5/month after free trial

---

## Cost Comparison

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| **Render Free** | $0 | Easy setup, free tier | Sleeps after inactivity |
| **Render Paid** | $7-25/mo | Always on, good performance | Monthly cost |
| **Railway** | $5-20/mo | Simple, auto-deploy | Credit-based pricing |
| **DigitalOcean** | $12-25/mo | Full control, scalable | Requires server management |
| **Heroku** | $7-25/mo | Easy deployment | Expensive for database |

---

## Next Steps

1. ✅ Set up PostgreSQL locally
2. ✅ Create backend project structure
3. ✅ Implement authentication
4. ✅ Create API endpoints
5. ✅ Update frontend to use API
6. ✅ Test locally
7. ✅ Deploy to production
8. ✅ Migrate existing localStorage data

---

## Migration Strategy

To move existing localStorage data to PostgreSQL:

**frontend/src/utils/migrate.ts**:
```typescript
import api from '../services/api';

export async function migrateLocalDataToBackend() {
  try {
    // Get data from localStorage
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    const loans = JSON.parse(localStorage.getItem('loans') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    // Upload to backend
    for (const member of members) {
      await api.createMember(member);
    }

    for (const loan of loans) {
      await api.createLoan(loan);
    }

    for (const transaction of transactions) {
      await api.createTransaction(transaction);
    }

    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}
```

Would you like me to start implementing any specific part of this backend setup?
