# Flowcore Analytics Collector

A privacy-first analytics collection API built with Elysia.js that emits events to Flowcore. This service accepts lightweight page-view and custom-event payloads from browsers, computes daily salted hashes of IP + User-Agent for privacy-safe visitor identification, and emits each hit to Flowcore's immutable event log.

## Features

🔒 **Privacy-First**: No raw IPs or personal identifiers stored - only daily rotating hashes
🚀 **Lightweight**: Minimal overhead with fast response times (p50 ≤ 50ms)
🛡️ **GDPR Compliant**: No cookies, no persistent tracking, automatic data anonymization
⚡ **Real-time**: Events flow to Flowcore for immediate analytics processing
📊 **Scalable**: Stateless design with horizontal scaling support
🔍 **Observable**: Health checks, metrics, and structured logging

## Architecture

- **Data Core**: `flow-analytics`
- **Flow Type**: `visitor.v0`
- **Event Type**: `visitor.tracked.v0`

The collector processes analytics events through Flowcore Pathways, ensuring reliable delivery and event ordering.

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Required environment variables:
- `SECRET_KEY`: 32+ character secret for salt generation
- `FLOWCORE_TENANT`: Your Flowcore tenant name
- `FLOWCORE_WEBHOOK_BASEURL`: Flowcore webhook URL
- `FLOWCORE_WEBHOOK_API_KEY`: Flowcore API key
- `FLOWCORE_TRANSFORMER_SECRET`: Secret for transformer authentication

### 3. Set Up Flowcore Resources

Update `flowcore.yaml` and `flowcore.local.yaml` with your tenant information, then create the data core:

```bash
bun run flowcore:apply:dev
```

### 4. Start Development Server

```bash
bun run dev
```

The server will start at `http://localhost:3000` with:
- API docs at `/swagger`
- Health check at `/healthz`
- Metrics at `/metrics`
- Analytics endpoint at `/api/event`

## API Endpoints

### POST /api/event

Track page views and custom events:

```typescript
interface AnalyticsEvent {
  pathname: string;           // Required: Page pathname
  referrer?: string;          // Optional: Referrer URL
  eventName?: string;         // Optional: Custom event name
  customProperties?: Record<string, unknown>; // Optional: Event metadata
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{
    "pathname": "/home",
    "referrer": "https://google.com",
    "eventName": "page_view"
  }'
```

### GET /healthz

Simple health check for load balancers:

```json
{ "status": "ok" }
```

### GET /health

Detailed health information including salt rotation status:

```json
{
  "status": "ok",
  "service": "analytics",
  "pathwaysConfigured": true,
  "flowType": "visitor.v0",
  "saltRotation": {
    "nextRotationAt": "2024-01-02T00:00:00.000Z",
    "secondsUntilRotation": 43200
  }
}
```

### GET /metrics

Prometheus-compatible metrics for monitoring.

## Privacy Implementation

### Daily Salt Rotation

The collector generates a new salt every day at midnight UTC using:
```
salt = sha256(YYYY-MM-DD + SECRET_KEY)
```

### Visitor Hash Generation

Visitor identification uses:
```
visitorHash = sha256(IP + UserAgent + dailySalt)
```

This creates a unique but anonymous identifier that:
- ✅ Allows same-day visitor tracking
- ✅ Resets daily for privacy
- ✅ Cannot be reverse-engineered
- ✅ Contains no personal information

## Development Workflow

### Local Development with Flowcore

1. **Stream events in real-time:**
   ```bash
   bun run flowcore:stream
   ```

2. **Backfill historical events:**
   ```bash
   bun run flowcore:backfill
   ```

3. **Apply configuration changes:**
   ```bash
   bun run flowcore:apply:dev
   ```

### Testing the API

Send a test event:

```bash
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"pathname": "/test", "eventName": "test_event"}'
```

Check the logs to see the privacy hash generation and Flowcore emission.

## Frontend Integration

### Minimal JavaScript Snippet

```html
<script>
(function() {
  const ANALYTICS_ENDPOINT = 'http://localhost:3000/api/event';
  
  function track(eventName, customProperties = {}) {
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pathname: window.location.pathname,
        referrer: document.referrer,
        eventName,
        customProperties
      })
    }).catch(console.error);
  }
  
  // Track page view
  track('page_view');
  
  // Expose global function for custom events
  window.trackEvent = track;
})();
</script>
```

### Usage Examples

```javascript
// Track custom events
trackEvent('button_click', { button: 'signup' });
trackEvent('form_submit', { form: 'contact' });
trackEvent('video_play', { video: 'intro', duration: 120 });
```

## Deployment

### Docker

```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY src ./src
COPY tsconfig.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/healthz || exit 1

EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
```

### Environment Variables for Production

```bash
# Required
SECRET_KEY=your-production-secret-key-32-chars-min
FLOWCORE_TENANT=your-production-tenant
FLOWCORE_WEBHOOK_BASEURL=https://your-production-webhook.flowcore.io
FLOWCORE_WEBHOOK_API_KEY=your-production-api-key
FLOWCORE_TRANSFORMER_SECRET=your-production-transformer-secret

# Optional for scaling
REDIS_URL=redis://your-redis-instance:6379
POSTGRES_CONNECTION_STRING=postgresql://user:pass@host:5432/db
```

## Monitoring

### Metrics

The `/metrics` endpoint provides Prometheus-compatible metrics:

- `analytics_salt_rotation_seconds`: Time until next salt rotation
- `analytics_service_info`: Service metadata and configuration

### Alerts

Set up alerts for:
- High error rates (>0.1%)
- Salt rotation failures
- Flowcore connectivity issues
- High response times (p95 >150ms)

## Configuration Files

- `flowcore.yaml`: Production Flowcore configuration
- `flowcore.local.yaml`: Local tenant override
- `flowcore.local.development.yaml`: Development proxy endpoints
- `env.example`: Environment variables template

## Project Structure

```
src/
├── env/
│   └── server.ts           # Environment configuration
├── lib/
│   └── privacy.ts          # Privacy utilities (hashing, salt)
├── pathways/
│   ├── pathways.ts         # Main pathways router
│   ├── index.ts            # Pathways exports
│   └── contracts/
│       ├── visitor.v0.ts   # Event schemas
│       └── visitor.v0.handlers.ts # Event handlers
├── services/
│   └── analytics.ts        # Analytics service logic
└── index.ts               # Main application
```

## Contributing

1. Ensure all environment variables are configured
2. Run `bun run flowcore:apply:dev` to set up Flowcore resources
3. Test with `bun run dev` and validate events flow correctly
4. Update documentation for any new features

## License

[Your License Here]