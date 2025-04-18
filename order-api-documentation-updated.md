# Tài liệu API Quản lý Đơn hàng và Người dùng

Tài liệu này mô tả các API endpoints cho việc quản lý đơn hàng và thông tin người dùng trong hệ thống. Các endpoints này cho phép người dùng tạo đơn hàng, cập nhật thông tin cá nhân và quản trị viên quản lý đơn hàng.

## URL Cơ sở

Tất cả các API endpoints đều có tiền tố: `/api/v1`

## Xác thực

Tất cả các endpoints đều yêu cầu xác thực bằng JWT token. Bao gồm token trong header Authorization:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

JWT token chứa thông tin người dùng, bao gồm:
- `id`: ID của người dùng
- `email`: Email của người dùng
- `isAdmin`: Quyền admin của người dùng (boolean)

Khi token được xác thực, thông tin người dùng sẽ được đính kèm vào `req.user`.

## Mô hình dữ liệu

### User Model

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  address: String,
  password: String, // Mật khẩu đã được mã hóa
  isAdmin: Boolean,
  orders: [ObjectId], // Tham chiếu đến các đơn hàng
  cartItems: [ObjectId], // Tham chiếu đến các mục trong giỏ hàng
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model

```javascript
{
  _id: ObjectId,
  user: {
    _id: ObjectId,
    name: String,
    email: String,
    phone: String,
    address: String
  },
  items: [
    {
      product: {
        _id: ObjectId,
        name: String,
        price: Number,
        pictureURL: String
      },
      quantity: Number
    }
  ],
  totalPrice: Number,
  status: String, // 'pending', 'processing', 'shipped', 'delivered', 'completed'
  paymentDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Các Endpoints Người dùng

### 1. Lấy Thông tin Cá nhân

Lấy thông tin cá nhân của người dùng đã xác thực.

**Endpoint:** `GET /user/profile`

**Xác thực:** Bắt buộc

**Tham số:** Không có

**Phản hồi:**

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "0987654321",
    "address": "123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh",
    "isAdmin": false,
    "createdAt": "2023-06-15T10:30:00.000Z",
    "updatedAt": "2023-06-15T10:35:00.000Z"
  },
  "message": "Success"
}
```

**Phản hồi Lỗi:**

- Nếu người dùng không tồn tại:
```json
{
  "success": false,
  "message": "User not found",
  "statusCode": 404
}
```

**Mã React tham khảo:**
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setProfile(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile data found</div>;

  return (
    <div>
      <h2>My Profile</h2>
      <div>
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phone || 'Not provided'}</p>
        <p><strong>Address:</strong> {profile.address || 'Not provided'}</p>
      </div>

      <div>
        <a href="/profile/edit">Edit Profile</a>
      </div>
    </div>
  );
};

export default ProfilePage;
```

### 2. Cập nhật Thông tin Cá nhân

Cập nhật thông tin cá nhân của người dùng đã xác thực. Không bao gồm việc thay đổi mật khẩu.

**Endpoint:** `PUT /user/profile`

**Xác thực:** Bắt buộc

**Body Request:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phone": "0987654321",
  "address": "123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
}
```

**Lưu ý:** Tất cả các trường đều là tùy chọn. Bạn có thể chỉ cập nhật một hoặc nhiều trường.

**Phản hồi:**

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "0987654321",
    "address": "123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh",
    "isAdmin": false,
    "createdAt": "2023-06-15T10:30:00.000Z",
    "updatedAt": "2023-06-15T10:35:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

**Phản hồi Lỗi:**

- Nếu không có dữ liệu cập nhật:
```json
{
  "success": false,
  "message": "No data provided for update",
  "statusCode": 400
}
```

- Nếu email đã được sử dụng bởi tài khoản khác:
```json
{
  "success": false,
  "message": "Email already in use by another account",
  "statusCode": 400
}
```

- Nếu số điện thoại đã được sử dụng bởi tài khoản khác:
```json
{
  "success": false,
  "message": "Phone number already in use by another account",
  "statusCode": 400
}
```

**Mã React tham khảo:**
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Lấy thông tin người dùng hiện tại
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = response.data.data;
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || ''
        });
      } catch (err) {
        setError('Failed to load user profile');
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/v1/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Update Profile</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Profile updated successfully!</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="phone">Phone:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="address">Address:</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
```

## Các Endpoints Đơn hàng

### 1. Lấy Tất cả Đơn hàng

Lấy danh sách đơn hàng. Đối với người dùng thông thường, chỉ trả về đơn hàng của họ. Đối với quản trị viên, trả về tất cả đơn hàng.

**Endpoint:** `GET /orders`

**Xác thực:** Bắt buộc

**Tham số:** Không có

**Phản hồi:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "user": {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
        "name": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "phone": "0987654321",
        "address": "123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
      },
      "items": [
        {
          "product": {
            "_id": "65f1a2b3c4d5e6f7a8b9c0d3",
            "name": "Tên Sản phẩm",
            "price": 299000,
            "pictureURL": "https://example.com/product.jpg"
          },
          "quantity": 2
        }
      ],
      "totalPrice": 598000,
      "status": "pending",
      "paymentDate": "2023-06-15T10:30:00.000Z",
      "createdAt": "2023-06-15T10:30:00.000Z",
      "updatedAt": "2023-06-15T10:30:00.000Z"
    }
  ],
  "message": "Success"
}
```

### 2. Lấy Đơn hàng theo ID

Lấy một đơn hàng cụ thể theo ID. Người dùng chỉ có thể truy cập đơn hàng của họ, trong khi quản trị viên có thể truy cập bất kỳ đơn hàng nào.

**Endpoint:** `GET /orders/:id`

**Xác thực:** Bắt buộc

**Tham số:**
- `id` (tham số đường dẫn): ID của đơn hàng cần lấy

**Phản hồi:**

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "phone": "0987654321",
      "address": "123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
    },
    "items": [
      {
        "product": {
          "_id": "65f1a2b3c4d5e6f7a8b9c0d3",
          "name": "Tên Sản phẩm",
          "price": 299000,
          "pictureURL": "https://example.com/product.jpg"
        },
        "quantity": 2
      }
    ],
    "totalPrice": 598000,
    "status": "pending",
    "paymentDate": "2023-06-15T10:30:00.000Z",
    "createdAt": "2023-06-15T10:30:00.000Z",
    "updatedAt": "2023-06-15T10:30:00.000Z"
  },
  "message": "Success"
}
```

### 3. Tạo Đơn hàng Mới

Tạo đơn hàng mới cho người dùng đã xác thực dựa trên nội dung giỏ hàng của họ.

**Endpoint:** `POST /orders`

**Xác thực:** Bắt buộc

**Body Request:** Không có (Đơn hàng được tạo từ giỏ hàng của người dùng)

**Phản hồi:**

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "user": "65f1a2b3c4d5e6f7a8b9c0d2",
    "items": [
      {
        "product": {
          "_id": "65f1a2b3c4d5e6f7a8b9c0d3",
          "name": "Tên Sản phẩm",
          "price": 299000,
          "pictureURL": "https://example.com/product.jpg"
        },
        "quantity": 2
      }
    ],
    "totalPrice": 598000,
    "status": "pending",
    "paymentDate": "2023-06-15T10:30:00.000Z",
    "createdAt": "2023-06-15T10:30:00.000Z",
    "updatedAt": "2023-06-15T10:30:00.000Z"
  },
  "message": "Order created successfully"
}
```

**Phản hồi Lỗi:**

- Nếu giỏ hàng trống:
```json
{
  "success": false,
  "message": "Cart is empty",
  "statusCode": 400
}
```

- Nếu một sản phẩm trong giỏ hàng hết hàng:
```json
{
  "success": false,
  "message": "Not enough stock for product Tên Sản phẩm. Available: 1",
  "statusCode": 400
}
```

### 4. Cập nhật Trạng thái Đơn hàng (Chỉ Admin)

Cập nhật trạng thái của đơn hàng. Endpoint này chỉ có thể truy cập bởi quản trị viên.

**Endpoint:** `PUT /orders/:id/status`

**Xác thực:** Bắt buộc (Chỉ Admin)

**Tham số:**
- `id` (tham số đường dẫn): ID của đơn hàng cần cập nhật

**Body Request:**
```json
{
  "status": "processing"
}
```

Các giá trị trạng thái hợp lệ:
- `pending`: Đơn hàng đã được tạo nhưng chưa được xử lý
- `processing`: Đơn hàng đang được xử lý
- `shipped`: Đơn hàng đã được gửi đi
- `delivered`: Đơn hàng đã được giao
- `completed`: Đơn hàng đã hoàn thành

**Phản hồi:**

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "user": "65f1a2b3c4d5e6f7a8b9c0d2",
    "items": [
      {
        "product": {
          "_id": "65f1a2b3c4d5e6f7a8b9c0d3",
          "name": "Tên Sản phẩm",
          "price": 299000,
          "pictureURL": "https://example.com/product.jpg"
        },
        "quantity": 2
      }
    ],
    "totalPrice": 598000,
    "status": "processing",
    "paymentDate": "2023-06-15T10:30:00.000Z",
    "createdAt": "2023-06-15T10:30:00.000Z",
    "updatedAt": "2023-06-15T10:35:00.000Z"
  },
  "message": "Order status updated to processing"
}
```

**Phản hồi Lỗi:**

- Nếu người dùng không phải là admin:
```json
{
  "success": false,
  "message": "Only administrators can update order status",
  "statusCode": 403
}
```

- Nếu thiếu ID đơn hàng hoặc trạng thái:
```json
{
  "success": false,
  "message": "Order ID and status are required",
  "statusCode": 400
}
```

- Nếu trạng thái không hợp lệ:
```json
{
  "success": false,
  "message": "Invalid status: invalid_status",
  "statusCode": 400
}
```

- Nếu cố gắng thay đổi trạng thái của đơn hàng đã giao:
```json
{
  "success": false,
  "message": "Cannot change status of a delivered order",
  "statusCode": 400
}
```

## Quy trình Trạng thái Đơn hàng

Quy trình thông thường của trạng thái đơn hàng là:

1. `pending`: Trạng thái ban đầu khi đơn hàng được tạo
2. `processing`: Đơn hàng đang được xử lý (sau khi xác nhận thanh toán)
3. `shipped`: Đơn hàng đã được gửi đi
4. `delivered`: Đơn hàng đã được giao cho khách hàng
5. `completed`: Đơn hàng đã hoàn thành (trạng thái cuối cùng)

## Lưu ý về Thông tin Giao hàng

Trong hệ thống này, thông tin giao hàng được lấy trực tiếp từ thông tin người dùng. Khi người dùng cập nhật thông tin cá nhân (tên, địa chỉ, số điện thoại), thông tin này sẽ được sử dụng cho việc giao hàng trong các đơn hàng mới.

Khi hiển thị thông tin đơn hàng, API sẽ trả về thông tin người dùng đầy đủ bao gồm địa chỉ và số điện thoại. Frontend có thể sử dụng thông tin này để hiển thị thông tin giao hàng.

## Lưu ý về Kiểm tra Quyền Admin

Trong hệ thống này, quyền admin được kiểm tra thông qua trường `isAdmin` trong đối tượng người dùng. Khi một người dùng đăng nhập, thông tin của họ (bao gồm `isAdmin`) được lưu trong JWT token. Khi token được xác thực, thông tin người dùng được đính kèm vào `req.user`.

Trong controller, quyền admin được kiểm tra như sau:
```javascript
const isAdmin = req.user.isAdmin;
if (!isAdmin) {
  return errorResponse(res, 'Only administrators can update order status', 403);
}
```

## Hướng dẫn Triển khai Frontend

### Cho Người dùng

#### 1. Xem Danh sách Đơn hàng

**Mô tả:** Hiển thị danh sách đơn hàng của người dùng hiện tại.

**API:** `GET /orders`

**Giao diện:**
- Hiển thị danh sách đơn hàng dưới dạng bảng hoặc danh sách
- Mỗi đơn hàng hiển thị: Mã đơn hàng, Ngày đặt, Tổng tiền, Trạng thái
- Có nút để xem chi tiết đơn hàng

**Mã React tham khảo:**
```jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>My Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>{order.status}</td>
              <td>
                <a href={`/orders/${order._id}`}>View Details</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersList;
```

#### 2. Xem Chi tiết Đơn hàng

**Mô tả:** Hiển thị chi tiết của một đơn hàng cụ thể.

**API:** `GET /orders/:id`

**Giao diện:**
- Hiển thị thông tin đơn hàng: Mã đơn hàng, Ngày đặt, Trạng thái, Tổng tiền
- Hiển thị danh sách sản phẩm trong đơn hàng: Tên, Hình ảnh, Giá, Số lượng, Thành tiền
- Hiển thị thông tin giao hàng: Tên, Địa chỉ, Số điện thoại

**Mã React tham khảo:**
```jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/v1/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div>
      <h2>Order Details</h2>
      <div>
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</p>
      </div>

      <h3>Items</h3>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map(item => (
            <tr key={item._id}>
              <td>
                <img
                  src={item.product.pictureURL}
                  alt={item.product.name}
                  style={{ width: '50px', height: '50px' }}
                />
              </td>
              <td>{item.product.name}</td>
              <td>${item.product.price.toFixed(2)}</td>
              <td>{item.quantity}</td>
              <td>${(item.product.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Shipping Information</h3>
      <div>
        <p><strong>Name:</strong> {order.user.name}</p>
        <p><strong>Address:</strong> {order.user.address}</p>
        <p><strong>Phone:</strong> {order.user.phone}</p>
      </div>
    </div>
  );
};

export default OrderDetails;
```

#### 3. Tạo Đơn hàng

**Mô tả:** Tạo đơn hàng mới từ giỏ hàng hiện tại.

**API:** `POST /orders`

**Giao diện:**
- Nút "Checkout" hoặc "Place Order" trong trang giỏ hàng
- Trang xác nhận đơn hàng hiển thị thông tin giỏ hàng và thông tin giao hàng
- Nút "Confirm Order" để tạo đơn hàng

**Mã React tham khảo:**
```jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/orders', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Redirect to order details page
      navigate(`/orders/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      {error && <div className="error">{error}</div>}

      {/* Display cart items and shipping information here */}

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
};

export default Checkout;
```

### Cho Quản trị viên

#### 1. Quản lý Đơn hàng

**Mô tả:** Hiển thị và quản lý tất cả đơn hàng trong hệ thống.

**API:** `GET /orders`

**Giao diện:**
- Bảng hiển thị tất cả đơn hàng với các cột: Mã đơn hàng, Khách hàng, Ngày đặt, Tổng tiền, Trạng thái
- Có các nút để xem chi tiết và cập nhật trạng thái đơn hàng

**Mã React tham khảo:**
```jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>All Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.user.name}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>{order.status}</td>
              <td>
                <a href={`/admin/orders/${order._id}`}>View Details</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrdersList;
```

#### 2. Cập nhật Trạng thái Đơn hàng

**Mô tả:** Cho phép admin cập nhật trạng thái của đơn hàng.

**API:** `PUT /orders/:id/status`

**Giao diện:**
- Dropdown hoặc các nút radio để chọn trạng thái mới
- Nút "Update Status" để lưu thay đổi

**Mã React tham khảo:**
```jsx
import React, { useState } from 'react';
import axios from 'axios';

const UpdateOrderStatus = ({ orderId, currentStatus, onStatusUpdate }) => {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'completed', label: 'Completed' }
  ];

  const handleStatusChange = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/v1/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setLoading(false);

      // Call the callback function to update the parent component
      if (onStatusUpdate) {
        onStatusUpdate(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Update Order Status</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Status updated successfully!</div>}

      <div>
        <label htmlFor="status">Status:</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleStatusChange}
        disabled={loading || status === currentStatus}
      >
        {loading ? 'Updating...' : 'Update Status'}
      </button>
    </div>
  );
};

export default UpdateOrderStatus;
```

## Xử lý Lỗi

Tất cả các API endpoints đều trả về phản hồi lỗi phù hợp với mã trạng thái và thông báo. Triển khai frontend của bạn nên xử lý các lỗi này và hiển thị thông báo phù hợp cho người dùng.

**Mã React tham khảo cho xử lý lỗi:**
```jsx
import React, { useState } from 'react';
import axios from 'axios';

const ErrorHandlingExample = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiCall = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      await axios.post('/api/v1/orders', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Success handling
      setLoading(false);
    } catch (err) {
      setLoading(false);

      // Error handling based on status code
      if (err.response) {
        const { status, data } = err.response;

        switch (status) {
          case 400:
            // Bad request - display validation errors
            setError(data.message || 'Invalid input data');
            break;
          case 401:
            // Unauthorized - redirect to login
            setError('Please log in to continue');
            // Redirect to login page
            break;
          case 403:
            // Forbidden - display permission error
            setError('You do not have permission to perform this action');
            break;
          case 404:
            // Not found
            setError('The requested resource was not found');
            break;
          case 500:
            // Server error
            setError('An unexpected error occurred. Please try again later.');
            break;
          default:
            setError('An error occurred. Please try again.');
        }
      } else {
        // Network error
        setError('Network error. Please check your connection and try again.');
      }
    }
  };

  return (
    <div>
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <button onClick={handleApiCall} disabled={loading}>
        {loading ? 'Processing...' : 'Submit'}
      </button>
    </div>
  );
};

export default ErrorHandlingExample;
```

## Các mã trạng thái lỗi phổ biến:
- `400`: Bad Request (thiếu hoặc không hợp lệ tham số)
- `401`: Unauthorized (thiếu hoặc không hợp lệ xác thực)
- `403`: Forbidden (không đủ quyền)
- `404`: Not Found (không tìm thấy tài nguyên)
- `500`: Internal Server Error (lỗi phía máy chủ)

## Kết luận

Tài liệu API này cung cấp tất cả thông tin cần thiết để triển khai frontend cho quản lý đơn hàng. Các mã React tham khảo được cung cấp để giúp bạn bắt đầu nhanh chóng với việc triển khai các chức năng cần thiết.

Nếu bạn có bất kỳ câu hỏi hoặc cần làm rõ thêm, vui lòng liên hệ với đội phát triển API.
