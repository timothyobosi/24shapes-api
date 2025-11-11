# 24ShapesLab API

Standalone Node.js/Express API for processing enquiry forms with email notifications.

## Quick Start

### Prerequisites
- Node.js 18+
- Gmail account with App Password (or any SMTP provider)

### Installation

```bash
cd api
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your email credentials:
```env
PORT=5000
NODE_ENV=production
EMAIL_SERVICE=gmail
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password
RECIPIENT_EMAIL=admin@24shapeslab.com
```

### Development

```bash
npm run dev
```

The API will start on `http://localhost:5000`

### Production

```bash
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "ok"
}
```

### Submit Enquiry
```
POST /api/enquiry
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+254700123456",
  "serviceType": "blood-test",
  "preferredDate": "2025-11-20",
  "message": "Need full blood panel"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Enquiry submitted successfully. Check your email for confirmation."
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "All required fields must be provided"
}
```

## Available Services
- `blood-test` – Blood Test
- `molecular` – Molecular Diagnostics
- `microbiology` – Microbiology
- `urine-analysis` – Urine Analysis
- `cardiac` – Cardiac Markers
- `vaccination` – Vaccination
- `consultation` – General Consultation
- `other` – Other

## Testing

### Using PowerShell:
```powershell
$body = @{
  firstName = "John"
  lastName  = "Doe"
  email     = "john@example.com"
  phone     = "+254700123456"
  serviceType = "blood-test"
  preferredDate = "2025-11-20"
  message   = "Need full blood panel"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/enquiry -Method Post -Body $body -ContentType "application/json"
```

### Using curl:
```bash
curl -X POST http://localhost:5000/api/enquiry \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+254700123456",
    "serviceType": "blood-test",
    "preferredDate": "2025-11-20",
    "message": "Need full blood panel"
  }'
```

## Docker

### Build
```bash
docker build -t 24shapes-api .
```

### Run
```bash
docker run -p 5000:5000 --env-file .env 24shapes-api
```

## Deployment

### Render (Free Tier)

1. Push your repo to GitHub (with both `api/` and `frontend/` folders)
2. In Render Dashboard → New Web Service
3. Select your repository
4. Set:
   - **Root Directory**: `api`
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
5. Add Environment Variables (same as `.env`)
6. Deploy

### Railway / Fly.io / AWS

Similar process—set root directory to `api/` and configure the same environment variables.

## CORS Configuration

Update `src/index.js` with your frontend URL:
```javascript
const allowed = ['http://localhost:3000', 'https://your-frontend-domain.com'];
```

## Frontend Integration

```typescript
const API_URL = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://your-api.onrender.com';

const submitEnquiry = async (formData) => {
  const response = await fetch(`${API_URL}/api/enquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return response.json();
};
```

## Troubleshooting

### Email not sending
- Verify EMAIL_USER and EMAIL_PASSWORD in `.env`
- Check Gmail App Password (not regular password)
- Enable "Less secure app access" if using basic auth
- Check console for SMTP errors

### CORS errors
- Add your frontend URL to the `allowed` list in `src/index.js`
- Ensure your frontend sends requests to the correct API URL

### Port already in use
- Change `PORT` in `.env` or run with: `PORT=5001 npm start`

## License

MIT
