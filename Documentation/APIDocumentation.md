# 📘 API Documentation — School Equipment Lending System  
**Version:** 1.0  
**Base URL:** `http://localhost:51567`  
**Specification:** OpenAPI 3.0  

---

## 🔐 **Authentication (AuthController)**

### **POST** `/api/Auth/signup`
**Description:** Register a new user (student, staff, or admin).  
**Auth Required:** ❌ No  

**Request Body (JSON):**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "student"
}
```

**Responses:**
| Code | Description |
|------|--------------|
| 200 | Registration successful, returns token and user details |
| 400 | User already exists or validation error |

---

### **POST** `/api/Auth/login`
**Description:** Authenticate an existing user and return a JWT token.  
**Auth Required:** ❌ No  

**Request Body (JSON):**
```json
{
  "email": "string",
  "password": "string"
}
```

**Responses:**
| Code | Description |
|------|--------------|
| 200 | Login successful, returns JWT token and user data |
| 401 | Invalid credentials |

---

## 📦 **Items (ItemsController)**

### **GET** `/api/Items`
**Description:** Fetch all equipment items with optional search or pagination.  
**Auth Required:** ✅ Yes  

**Query Parameters (optional):**
| Name | Type | Description |
|------|------|-------------|
| `q` | string | Search keyword |
| `category` | string | Filter by category |
| `available` | bool | Show only available items |
| `page` | int | Page number |
| `limit` | int | Results per page |

**Responses:**
| Code | Description |
|------|--------------|
| 200 | Returns list of items |
| 401 | Unauthorized |

---

### **GET** `/api/Items/search`
**Description:** Search items by name or category.  
**Auth Required:** ✅ Yes  

**Responses:**
| Code | Description |
|------|--------------|
| 200 | Returns filtered items |
| 401 | Unauthorized |

---

### **POST** `/api/Items`
**Description:** Create a new equipment record.  
**Auth Required:** ✅ Admin only  

**Request Body (JSON):**
```json
{
  "id": 0,
  "name": "string",
  "category": "string",
  "condition": "string",
  "totalQuantity": 0,
  "availableQuantity": 0,
  "description": "string"
}
```

**Responses:**
| Code | Description |
|------|--------------|
| 200 | Item created successfully |
| 400 | Invalid input or validation error |
| 401 | Unauthorized |

---

### **PUT** `/api/Items/{id}`
**Description:** Update existing item details.  
**Auth Required:** ✅ Admin only  

**Request Body (JSON):**
```json
{
  "name": "string",
  "category": "string",
  "condition": "string",
  "totalQuantity": 0,
  "availableQuantity": 0,
  "description": "string"
}
```

**Responses:**
| Code | Description |
|------|--------------|
| 200 | Item updated |
| 404 | Item not found |

---

### **DELETE** `/api/Items/{id}`
**Description:** Delete an item by ID.  
**Auth Required:** ✅ Admin only  

**Responses:**
| Code | Description |
|------|--------------|
| 200 | Item deleted |
| 404 | Item not found |

---

## 📋 **Requests (RequestsController)**

### **POST** `/api/Requests`
**Description:** Create a new equipment request.  
**Auth Required:** ✅ Student or staff  

**Request Body (JSON):**
```json
{
  "itemId": 0,
  "quantity": 1,
  "requestedFrom": "2025-11-10T00:00:00",
  "requestedTo": "2025-11-15T00:00:00",
  "notes": "Need for project"
}
```

**Responses:**
| Code | Description |
|------|--------------|
| 200 | Request created |
| 400 | Invalid date range or overlap |
| 401 | Unauthorized |

---

### **GET** `/api/Requests`
**Description:** Get all requests (admin/staff) or only user’s requests (students).  
**Auth Required:** ✅ Yes  

**Responses:**
| Code | Description |
|------|--------------|
| 200 | Returns requests list |
| 401 | Unauthorized |

---

### **POST** `/api/Requests/{id}/decide`
**Description:** Approve, reject, issue, or return a request.  
**Auth Required:** ✅ Admin/Staff  

**Request Body (JSON):**
```json
{
  "action": "approve",
  "notes": "Approved for use"
}
```

**Actions Supported:**
| Action | Description |
|---------|--------------|
| approve | Approve the request |
| reject | Reject the request |
| issue | Mark item as issued |
| return | Mark item as returned |

**Responses:**
| Code | Description |
|------|--------------|
| 200 | Status updated |
| 400 | Invalid or conflicting state |
| 404 | Request not found |

---

## 🧾 **Audit Logs (AuditLogsController)**

### **GET** `/api/AuditLogs`
**Description:** Retrieve history of all request actions.  
**Auth Required:** ✅ Admin only  

**Responses:**
| Code | Description |
|------|--------------|
| 200 | Returns list of audit logs |
| 401 | Unauthorized |

---

## 🧠 Notes
- All authenticated endpoints require a **Bearer JWT token** in the header:  
  ```
  Authorization: Bearer <your_token_here>
  ```
- Swagger UI available at  
  👉 [http://localhost:51567/swagger/index.html](http://localhost:51567/swagger/index.html)
- OpenAPI JSON file:  
  👉 [http://localhost:51567/swagger/v1/swagger.json](http://localhost:51567/swagger/v1/swagger.json)
