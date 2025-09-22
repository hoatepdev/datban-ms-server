# Sử dụng Node.js 20 alpine (nhẹ, tối ưu cho production)
FROM node:20-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và cài dependencies
COPY package*.json ./
RUN npm install --production

# Copy toàn bộ code
COPY . .

# Build NestJS app
RUN npm run build

# Expose port của service
EXPOSE 9004

# Chạy ứng dụng
CMD ["npm", "run", "start:prod"]
