# Flowcore Analytics Collector

A privacy-first analytics collection API built with Elysia.js that emits events to Flowcore.

## Features

**Privacy-First**: No raw IPs or personal identifiers stored - only daily rotating hashes

**GDPR Compliant**: No cookies, no persistent tracking, automatic data 
anonymization

**Real-time**: Events flow to Flowcore for immediate analytics processing

## Prerequisites

- [Flowcore CLI](https://docs.flowcore.io/guides/flowcore-cli/install-cli/)

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

### 3. Set Up Flowcore Resources

Update `flowcore.yaml` and `flowcore.local.yaml` with your tenant name

```bash
bun flowcore:apply
```

### 4. run the docker compose file

```bash
docker compose up -d
```
the docker compose file will create a postgres database.
the table will be created automatically when the first event is sent.

### 5. Start Development Server

```bash
bun dev
```

## API Endpoints

### POST /api/pageview

Track page views and custom events:

```typescript
interface AnalyticsEvent {
  pathname: string;           // Required: Page pathname. The pathname of the page the user is on.
  referrer: string;          // Required: Referrer URL. which page referred the user to this page.
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/pageview \
  -H "Content-Type: application/json" \
  -d '{
    "pathname": "/home",
    "referrer": "https://google.com",
  }'
```

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