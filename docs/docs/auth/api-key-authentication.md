# API Key Authentication System Documentation

## 1. Introduction
### 1.1 Overview
Secure authentication system for programmatic API access using tenant-specific API keys with role-based permission inheritance.

---

## 2. System Architecture
### 2.1 Database Schema
```mermaid
erDiagram
    tblAPIKeys {
        string apiKeyID PK
        string tenantID FK
        string keyHash
        string keyName
        datetime createdDate
        datetime expiryDate
        bool isActive
    }
    
    tblAPIKeyRoleMappings {
        string mappingID PK
        string apiKeyID FK
        string roleID FK
    }
```

### 2.2 Core Components
| Component                 | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| API Key Service            | Handles CRUD operations, role mapping, and transaction management          |
| Authentication Middleware | Validates keys, extracts user context, and enforces permissions            |
| API Key Controller         | Manages REST endpoints and request/response handling                       |

---

## 3. Authentication Workflow
```mermaid
sequenceDiagram
    participant Client
    participant Backend
    participant Database
    
    Client->>Backend: API Request (with Authentication header)
    Backend->>Database: Validate Key + Get Tenant/Roles
    alt Valid Key
        Database-->>Backend: Key Details + Roles
        Backend->>Backend: Set Request Context
        Backend-->>Client: 200 OK + Response Data
    else Invalid Key
        Backend-->>Client: 401 Unauthorized
    end
```

---

## 4. API Key Management
### 4.1 Management Endpoints
| Endpoint                                      | Method | Description                         |
|-----------------------------------------------|--------|-------------------------------------|
| `/tenants/{tenantID}/apikeys`                 | GET    | List all API keys                   |
| `/tenants/{tenantID}/apikeys`                 | POST   | Create new API key                  |
| `/tenants/{tenantID}/apikeys/{apiKeyID}`      | GET    | Get key details                     |
| `/tenants/{tenantID}/apikeys/{apiKeyID}`      | PUT    | Update key configuration            |
| `/tenants/{tenantID}/apikeys/{apiKeyID}`      | DELETE | Disable API key                     |

### 4.2 Key Lifecycle Management
1. **Creation**
   - Generate cryptographically secure key (256-bit)
   - Store key hash (PBKDF2 with HMAC-SHA256)
   - Set default 90-day expiration

2. **Rotation**
   - Auto-generate new keys before expiration
   - Maintain legacy key validity for 7 days

3. **Revocation**
   - Immediate disablement via DELETE endpoint
   - Global invalidation within 60 seconds

---

## 5. Usage Guidelines
### 5.1 Authentication Header
```http
GET /api/v1/resources HTTP/1.1
Host: api.example.com
Authorization: api_key sk_live_12ab34cd56ef78gh90ij12kl34mn56op
```

### 5.2 Permission Inheritance
```javascript
// Example role mapping
{
  "apiKeyID": "key_12345",
  "roles": [
    "tenant.admin",
    "global.monitoring"
  ]
}
```

---

## 6. Security Implementation
### 6.1 Key Generation
```javascript
const generateAPIKey = () => {
  const buffer = crypto.randomBytes(32);
  return buffer.toString('base64url');
};
```

### 6.2 Security Features
| Feature                  | Implementation Details                     |
|--------------------------|-------------------------------------------|
| Tenant Isolation         | Mandatory tenantID in all requests        |
| Rate Limiting            | 1000 requests/minute/key                  |
| Audit Logging            | Full request metadata capture             |
| Key Hashing              | Argon2id with 64MB memory cost            |

---

## 7. Error Handling
### 7.1 Common Error Codes
| Code | Scenario                          | Resolution                         |
|------|-----------------------------------|------------------------------------|
| 401  | Invalid/missing API key           | Verify key header format           |
| 403  | Insufficient permissions          | Check role assignments             |
| 429  | Rate limit exceeded               | Implement exponential backoff      |
| 500  | Database connection failure       | Retry with jittered delay          |

---

