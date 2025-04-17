# Tài liệu API Quản lý Đơn hàng

Tài liệu này mô tả các API endpoints cho việc quản lý đơn hàng trong hệ thống. Các endpoints này cho phép người dùng tạo đơn hàng và quản trị viên quản lý đơn hàng.

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

Khi token được xác thực, thông tin người dùng sẽ được đính kèm vào `req.user`.

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
        "email": "nguyenvana@example.com"
      },
      "items": [
        {
          "product": "65f1a2b3c4d5e6f7a8b9c0d3",
          "name": "Tên Sản phẩm",
          "price": 299000,
          "quantity": 2,
          "pictureURL": "https://example.com/product.jpg"
        }
      ],
      "totalPrice": 598000,
      "status": "pending",
      "transactionId": null,
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
      "email": "nguyenvana@example.com"
    },
    "items": [
      {
        "product": {
          "_id": "65f1a2b3c4d5e6f7a8b9c0d3",
          "name": "Tên Sản phẩm",
          "price": 299000,
          "pictureURL": "https://example.com/product.jpg",
          "description": "Mô tả sản phẩm"
        },
        "name": "Tên Sản phẩm",
        "price": 299000,
        "quantity": 2,
        "pictureURL": "https://example.com/product.jpg"
      }
    ],
    "totalPrice": 598000,
    "status": "pending",
    "transactionId": null,
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
        "product": "65f1a2b3c4d5e6f7a8b9c0d3",
        "name": "Tên Sản phẩm",
        "price": 299000,
        "quantity": 2,
        "pictureURL": "https://example.com/product.jpg"
      }
    ],
    "totalPrice": 598000,
    "status": "pending",
    "transactionId": null,
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
        "product": "65f1a2b3c4d5e6f7a8b9c0d3",
        "name": "Tên Sản phẩm",
        "price": 299000,
        "quantity": 2,
        "pictureURL": "https://example.com/product.jpg"
      }
    ],
    "totalPrice": 598000,
    "status": "processing",
    "transactionId": null,
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

1. **Xem Đơn hàng**
   - Triển khai trang hiển thị đơn hàng của người dùng
   - Sử dụng `GET /orders` để lấy đơn hàng của người dùng
   - Hiển thị chi tiết đơn hàng như các mục, tổng giá, trạng thái và ngày tháng

2. **Xem Chi tiết Đơn hàng**
   - Triển khai trang hiển thị thông tin chi tiết về một đơn hàng cụ thể
   - Sử dụng `GET /orders/:id` để lấy chi tiết đơn hàng
   - Hiển thị tất cả thông tin đơn hàng bao gồm các mục, giá, trạng thái và ngày tháng

3. **Tạo Đơn hàng**
   - Triển khai quy trình thanh toán tạo đơn hàng từ giỏ hàng của người dùng
   - Sử dụng `POST /orders` để tạo đơn hàng
   - Sau khi tạo đơn hàng thành công, chuyển hướng đến trang chi tiết đơn hàng
   - Xử lý các lỗi tiềm ẩn như giỏ hàng trống hoặc hàng không đủ

### Cho Quản trị viên

1. **Xem Tất cả Đơn hàng**
   - Triển khai bảng điều khiển quản trị để hiển thị tất cả đơn hàng
   - Sử dụng `GET /orders` để lấy tất cả đơn hàng
   - Cung cấp các tùy chọn lọc theo trạng thái, ngày tháng, v.v.

2. **Xem Chi tiết Đơn hàng**
   - Triển khai trang hiển thị thông tin chi tiết về một đơn hàng cụ thể
   - Sử dụng `GET /orders/:id` để lấy chi tiết đơn hàng
   - Hiển thị tất cả thông tin đơn hàng bao gồm chi tiết người dùng, các mục, giá, trạng thái và ngày tháng

3. **Cập nhật Trạng thái Đơn hàng**
   - Triển khai chức năng cập nhật trạng thái của đơn hàng
   - Sử dụng `PUT /orders/:id/status` để cập nhật trạng thái đơn hàng
   - Cung cấp dropdown hoặc các nút cho các tùy chọn trạng thái khác nhau
   - Hiển thị thông báo thành công hoặc lỗi phù hợp

## Xử lý Lỗi

Tất cả các API endpoints đều trả về phản hồi lỗi phù hợp với mã trạng thái và thông báo. Triển khai frontend của bạn nên xử lý các lỗi này và hiển thị thông báo phù hợp cho người dùng.

Các mã trạng thái lỗi phổ biến:
- `400`: Bad Request (thiếu hoặc không hợp lệ tham số)
- `401`: Unauthorized (thiếu hoặc không hợp lệ xác thực)
- `403`: Forbidden (không đủ quyền)
- `404`: Not Found (không tìm thấy tài nguyên)
- `500`: Internal Server Error (lỗi phía máy chủ)

## Kết luận

Tài liệu API này cung cấp tất cả thông tin cần thiết để triển khai frontend cho quản lý đơn hàng. Nếu bạn có bất kỳ câu hỏi hoặc cần làm rõ thêm, vui lòng liên hệ với đội phát triển API.
