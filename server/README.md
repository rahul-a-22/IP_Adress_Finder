# IP Address Finder - Backend Server

This is the backend server for the IP Address Finder application. It provides a caching proxy for IP geolocation APIs to protect API keys and implement rate limiting.

## Features

- Express.js backend proxy for external IP APIs
- API key protection using environment variables
- Rate limiting to prevent abuse
- Response caching to reduce API calls
- Multiple IP lookup providers (ipapi.co and ipinfo.io)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your API keys for ipapi.co and ipinfo.io

3. Start the server:
   ```
   npm run dev    # Development with auto-reload
   npm start      # Production
   ```

## API Endpoints

### GET `/api/lookup/:ip?`

Looks up IP information using ipapi.co.

- If `:ip` is provided, it looks up that specific IP address
- If `:ip` is omitted, it looks up the client's IP address

Example response:
```json
{
  "ip": "8.8.8.8",
  "city": "Mountain View",
  "region": "California",
  "country_name": "United States",
  "latitude": 37.4056,
  "longitude": -122.0775,
  "org": "Google LLC",
  "timezone": "America/Los_Angeles"
}
```

### GET `/api/lookup-alt/:ip?`

Alternative IP lookup using ipinfo.io.

- If `:ip` is provided, it looks up that specific IP address
- If `:ip` is omitted, it looks up the client's IP address

### POST `/api/clear-cache`

Clears the server's IP lookup cache. For testing/admin purposes.

## Caching

Responses are cached for 1 hour by default. This can be configured in the `.env` file by changing the `CACHE_DURATION` value (in milliseconds).

## Rate Limiting

Requests are limited to 100 per 15-minute window per IP address to prevent abuse.