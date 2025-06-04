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

### 6. run local stream command for development testing

```bash
bun flowcore:stream
```

this will start a local event listener that will poll for events from the Flowcore Platform. 


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

