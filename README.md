# Flowcore Analytics Collector

A privacy-first analytics collection API built with Elysia.js that emits events to Flowcore.

## Features

**Privacy-First**: No raw IPs or personal identifiers stored - only daily rotating hashes

**GDPR Compliant**: No cookies, no persistent tracking, automatic data 
anonymization

**Real-time**: Events flow to Flowcore for immediate analytics processing

## Prerequisites

- [Flowcore CLI](https://docs.flowcore.io/guides/flowcore-cli/install-cli/)
- [Flowcore Platform account](https://flowcore.io)

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

Update `flowcore.yaml` with your tenant name and then run this command:

```bash
bun flowcore:apply:data-core
```
when you call this command you create a Data Core on the Flowcore Platform.

### 4. Run the docker compose file

```bash
docker compose up -d
```
the docker compose file will create a postgres database container.
Postgres is used to store the Flowcore Pathway state.
Flowcore Pathways is a Flowcore library used in this project.
The db table will be created automatically when the first event is sent.

### 5. Start Development Server

```bash
bun dev
```

### 6. Run command to start the local proxy

 This command will listen for events coming from the Flowcore Platform and route them to a POST endpoint in this project.
 The POST endpoint uses the Flowcore Pathways library to proxy events to Pathway handlers defined in the project.
 This command is used for local development and to make a local event listener.

```bash
bun flowcore:local:proxy
```

### 7. Run the test.html file and click the manual send button

This will send an event to the Flowcore Platform where it is stored and then it gets fanned out to the local proxy endpoint.


## API Endpoints

### POST /api/pageview

Track page views:

```typescript
interface AnalyticsEvent {
  pathname: string;           // Required: Page pathname. The pathname of the page the user is on.
  referrer: string;          // Required: Referrer URL. which page referred the user to this page.
}
```

**Example:**

```bash
curl -X POST http://localhost:3005/api/pageview \
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

