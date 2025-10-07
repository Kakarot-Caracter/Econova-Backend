# Orders API Documentation

## Overview

Complete Order management system with authentication, authorization, stock validation, and transaction safety.

---

## Database Schema

### Order Model

- `id`: String (UUID)
- `userId`: Int (Foreign key to User)
- `total`: Int (Price in cents/centavos)
- `status`: OrderStatus enum
- `items`: OrderItem[] (One-to-many relation)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### OrderItem Model

- `id`: String (UUID)
- `orderId`: String (Foreign key to Order)
- `productId`: String (Foreign key to Product)
- `quantity`: Int
- `price`: Int (Historical price in cents/centavos)
- `createdAt`: DateTime

### OrderStatus Enum

- `PENDING` - Initial status when order is created
- `PROCESSING` - Order is being prepared
- `SHIPPED` - Order has been shipped
- `DELIVERED` - Order has been delivered
- `CANCELLED` - Order has been cancelled

---

## API Endpoints

### 1. Create Order

**POST** `/orders`

**Authentication:** Required (USER or ADMIN)

**Authorization:** Users can only create orders for themselves

**Request Body:**

```json
{
  "userId": 1,
  "items": [
    {
      "productId": "uuid-of-product-1",
      "quantity": 2
    },
    {
      "productId": "uuid-of-product-2",
      "quantity": 1
    }
  ]
}
```

**Response (201):**

```json
{
  "id": "order-uuid",
  "userId": 1,
  "total": 15000,
  "status": "PENDING",
  "createdAt": "2025-09-30T06:00:00.000Z",
  "updatedAt": "2025-09-30T06:00:00.000Z",
  "items": [
    {
      "id": "item-uuid-1",
      "orderId": "order-uuid",
      "productId": "uuid-of-product-1",
      "quantity": 2,
      "price": 5000,
      "createdAt": "2025-09-30T06:00:00.000Z",
      "product": {
        "id": "uuid-of-product-1",
        "name": "Product Name",
        "price": 5000,
        "stock": 8,
        ...
      }
    }
  ],
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "phone": "+595123456789"
  }
}
```

**Validations:**

- User must exist
- All products must exist
- Sufficient stock must be available
- Quantity must be at least 1
- At least one item is required

**Business Logic:**

- Validates stock availability before creating order
- Stores historical price in OrderItem
- Decrements product stock in a transaction
- Calculates total automatically
- Sets initial status to PENDING

---

### 2. Get All Orders (Admin Only)

**GET** `/orders`

**Authentication:** Required (ADMIN only)

**Response (200):**

```json
[
  {
    "id": "order-uuid",
    "userId": 1,
    "total": 15000,
    "status": "PENDING",
    "createdAt": "2025-09-30T06:00:00.000Z",
    "updatedAt": "2025-09-30T06:00:00.000Z",
    "items": [...],
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

---

### 3. Get User Orders

**GET** `/orders/user/:userId`

**Authentication:** Required (USER or ADMIN)

**Authorization:** Users can only view their own orders, admins can view any

**Response (200):**

```json
[
  {
    "id": "order-uuid",
    "userId": 1,
    "total": 15000,
    "status": "DELIVERED",
    "createdAt": "2025-09-30T06:00:00.000Z",
    "updatedAt": "2025-09-30T06:00:00.000Z",
    "items": [
      {
        "id": "item-uuid",
        "quantity": 2,
        "price": 5000,
        "product": {
          "id": "product-uuid",
          "name": "Product Name",
          "image": "https://...",
          ...
        }
      }
    ]
  }
]
```

**Note:** Orders are sorted by creation date (newest first)

---

### 4. Get Order by ID

**GET** `/orders/:id`

**Authentication:** Required (USER or ADMIN)

**Authorization:** Users can only view their own orders, admins can view any

**Response (200):**

```json
{
  "id": "order-uuid",
  "userId": 1,
  "total": 15000,
  "status": "PROCESSING",
  "createdAt": "2025-09-30T06:00:00.000Z",
  "updatedAt": "2025-09-30T06:00:00.000Z",
  "items": [
    {
      "id": "item-uuid",
      "orderId": "order-uuid",
      "productId": "product-uuid",
      "quantity": 2,
      "price": 5000,
      "createdAt": "2025-09-30T06:00:00.000Z",
      "product": {
        "id": "product-uuid",
        "name": "Product Name",
        "description": "Product description",
        "price": 5000,
        "stock": 8,
        "image": "https://...",
        "category": "ELECTRONICS_TECH"
      }
    }
  ],
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "phone": "+595123456789"
  }
}
```

---

### 5. Update Order Status (Admin Only)

**PATCH** `/orders/:id/status`

**Authentication:** Required (ADMIN only)

**Request Body:**

```json
{
  "status": "SHIPPED"
}
```

**Valid Status Values:**

- `PENDING`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

**Response (200):**

```json
{
  "id": "order-uuid",
  "userId": 1,
  "total": 15000,
  "status": "SHIPPED",
  "createdAt": "2025-09-30T06:00:00.000Z",
  "updatedAt": "2025-09-30T06:30:00.000Z",
  "items": [...],
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Insufficient stock for product Product Name. Available: 5, Requested: 10",
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "You can only create orders for yourself",
  "error": "Forbidden"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Order with id order-uuid not found",
  "error": "Not Found"
}
```

---

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Example Usage with cURL

### Create Order

```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "items": [
      {
        "productId": "product-uuid-1",
        "quantity": 2
      }
    ]
  }'
```

### Get User Orders

```bash
curl -X GET http://localhost:3000/orders/user/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Order Status (Admin)

```bash
curl -X PATCH http://localhost:3000/orders/order-uuid/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED"
  }'
```

---

## Key Features

✅ **Stock Validation** - Validates product availability before order creation
✅ **Transaction Safety** - Uses Prisma transactions for data consistency
✅ **Historical Pricing** - Stores price at time of purchase in OrderItem
✅ **Role-Based Access** - Users can only access their own orders
✅ **Automatic Stock Management** - Decrements stock when order is created
✅ **Comprehensive Error Handling** - Clear error messages for all scenarios
✅ **Audit Trail** - Tracks creation and update timestamps
✅ **Nested Relations** - Returns complete order data with items and products

---

## Order Workflow

1. **User creates order** → Status: `PENDING`
2. **Admin processes order** → Status: `PROCESSING`
3. **Admin ships order** → Status: `SHIPPED`
4. **Order delivered** → Status: `DELIVERED`

Alternative flow:

- **Order cancelled** → Status: `CANCELLED`

---

## Notes

- Prices are stored as integers (cents/centavos) to avoid floating-point precision issues
- OrderItems store historical prices to maintain accurate order records even if product prices change
- Stock is automatically decremented when an order is created
- Orders cannot be deleted, only cancelled (preserves order history)
- All monetary values are in the smallest currency unit (e.g., cents for USD, centavos for PYG)
