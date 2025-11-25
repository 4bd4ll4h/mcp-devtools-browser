
# DevTool Broswer for developers

[![npm version](https://img.shields.io/npm/v/@4bd4ll4h/mcp-devtools-browser.svg)](https://www.npmjs.com/package/@4bd4ll4h/mcp-devtools-browser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)

> A powerful Model Context Protocol (MCP) server that provides LLMs with browser automation capabilities using Puppeteer.

## 🚀 Quick Start

```bash
npm install -g @4bd4ll4h/mcp-devtools-browser
```

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "devtools-browser": {
      "command": "npx",
      "args": ["@4bd4ll4h/mcp-devtools-browser"]
    }
  }
}
```

## ✨ Features

- **Browser Automation**: Open, navigate, and control browser pages
- **DOM Inspection**: Extract structured DOM data with accessibility focus
- **Network Monitoring**: Capture and analyze network requests
- **Event Logging**: Comprehensive session tracking and debugging
- **User Interactions**: Click, type, scroll, hover, and more
- **Visual Capture**: Screenshots and visual analysis
- **Resource Management**: Automatic cleanup and memory management

## 📖 Documentation

- [API Reference](API.md) - Complete tool and resource documentation
- [Examples](EXAMPLES.md) - Usage examples and tutorials
- [Development Guide](DEVELOPMENT.md) - Architecture and contribution guidelines
- [Contributing](CONTRIBUTING.md) - How to contribute to this project

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Project Specification

### **Project Overview**

This project aims to build a **Model Context Protocol (MCP)** server that assists an LLM in generating **high-quality, reliable web-scraping scripts** using **TypeScript + Puppeteer**.

The MCP will act as a managed gateway between:

* A real browser environment (Puppeteer)
* Page lifecycle events (requests, responses, selectors, DOM state)
* An LLM tasked with understanding the page and generating scraping actions

The goal:

> Allow the LLM to autonomously explore pages, inspect network traffic, extract DOM node paths/selectors, and generate robust scraping scripts on demand.

---

## **Core Use-Cases**

1. **Data Extraction From Any Website**

   * Offers, products, tables, PDFs, metadata, images

2. **Network Intelligence**

   * Detect backend API calls
   * Infer JSON data structures
   * Prioritize structured data over rendered HTML

3. **Dynamic DOM Inspection**

   * Choose stable selectors
   * Scroll and lazily load content
   * Handle shadow DOM, iframes, modals

---

## **Why an MCP?**

MCP provides:

* Structured bidirectional workflow
* Model actions with schema
* Better orchestration
* Reproducibility

It enables constructing **LLM-driven scraping agents**.

---

## **Primary Technical Challenges**

This system must solve:

### ✅ Exposing DevTools-like insights to an LLM

* Network requests/responses
* Headers, bodies, error codes

### ✅ Large DOM visibility

* Without overloading token limits

### ✅ Robust stateful browsing

* Tabs
* Navigation history
* Parallel extraction

---

## **High-Level Architecture**

```
LLM <--> MCP Server <--> Puppeteer Controller
                     |
                     ├── Browser Pool (multi-page sessions)
                     ├── Network Listener
                     └── DOM Snapshot Manager
```

---

## **Key Components**

### 1. **Browser Manager**

Responsibilities:

* Start/stop browser instances
* Create new tabs
* Close tabs
* Report session info

Recommendations:

* Maintain an internal registry keyed by `sessionId`
* One session per LLM conversation

### 2. **Tab/Page Manager**

For each page:

* Navigation
* Click, Type, Scroll, WaitForSelector
* Save screenshots
* Persist page state

Recommended:

* Limit max open tabs
* Auto-cleanup resources

### 3. **Network Interceptor**

Goals:

* Capture all XHR/fetch calls
* Inspect responses
* Identify API endpoints
* Detect potential structured data sources

MCP tool actions:

* `getNetworkRequests()`
* `filterRequestsBy(url|type|status)`
* `fetchResponseBody(requestId)`

### 4. **DOM Inspector**

Challenge:
Pages can be huge; LLM token limits apply.

Approaches:

#### **A. DOM Chunking**

Split the DOM into slices:

* By depth
* By visual viewport
* By selector path

#### **B. Selector Spotlight**

LLM requests:

* Highlight possible selectors for hovered element or query

#### **C. CSS Path Generation**

Automatically compute:

* CSS selectors
* XPath
* Robust heuristic selectors

---

## **Recommended LLM-Facing MCP Actions**

### Navigation

* `navigate(url)`
* `goBack()`
* `goForward()`

### DOM Interrogation

* `querySelector(selector)`
* `querySelectorAll(selector, limit)`
* `extractAttributes(selector, attrs[])`
* `getBoundingClientRect(selector)`
* `scroll(amount)`
* `scrollToBottom()`

### Network

* `listNetworkRequests(type?)`
* `getRequestDetails(requestId)`
* `getResponseBody(requestId)`

### Screenshots

* `captureScreenshot(mode=viewport|full)`

### Debugging

* `printConsoleLogs()`
* `printNetworkErrors()`

### Utility

* `generateSelectorsAtPoint(x,y)`

---

## **Browser/Tab Lifecycle Strategy**

### Session Rules

* Each MCP session creates **one browser instance**
* Tabs are registered and tracked
* Hard limit (e.g., 5) to avoid memory blowup

### Garbage Collection

* Idle tabs > N minutes → auto close
* Close all tabs on session end

### Tab Identification

Return structured tab state:

```json
{
  "tabId": "abc123",
  "url": "...",
  "title": "...",
  "loading": false
}
```

---

## **Exposing DevTools-Like Capabilities**

### Approach A — Chrome DevTools Protocol Events

Use:

* `page.on('request')`
* `page.on('response')`
* `page.on('console')`

Pros:

* Real-time
* Low overhead

### Approach B — Intercept & Store Network History

Store:

* Method
* URL
* Status
* Request body
* Response size/body hints

Let the LLM filter later.

### Approach C — Filter by Type

* XHR
* Fetch
* Media
* Stylesheet
* Script

Useful for target discovery.

**Recommended**: All three.

---

## **Making Large DOMs LLM-Friendly**

### Approach A — Contextual Chunking

Split DOM by:

* visible sections
* semantic regions (`<section>`, `<article>`)

### Approach B — Selector-Only Summaries

Instead of dumping HTML, provide:

```
selector -> value summary
```

Example:

```
.OfferTitle -> "Summer Sale"
.OfferPrice -> "$19.99"
```

### Approach C — On-Demand Snapshot

LLM asks:

> "Give me the DOM for the 'products' container"

You respond with localized HTML only.

### Recommended

A + C combination.

---

## **Your Suggested Way (Evaluation)**

### Strengths

✔ Monitoring requests catches hidden APIs
✔ DOM extraction enables visual scraping
✔ Intercepting lifecycle gives completeness

### Weaknesses / Risks

⚠ Dumping full DOM = token explosion
⚠ JSON responses can be massive
⚠ Too many network logs → noise
⚠ Repeated structure confusion for LLMs

### Potential Quality Issues

* Selector instability (dynamic classes)
* Infinite scroll complexity
* Event timing issues
* CSP blocking screenshots

We will mitigate these using heuristics and detection rules.

---

## **Recommended Selector Stability Heuristics**

1. Prefer:

* `data-*` attributes
* Semantic HTML
* Parent chains

2. Avoid:

* Obfuscated class names
* Auto-generated IDs

3. Validate:

* That selector matches consistent count across scroll events

---

## **Script Generation Philosophy**

Horizontal fallback order:

1. Structured API JSON (Best)
2. Semantic HTML
3. Computed DOM text
4. Visual scraping (worst)

The LLM should operate with this hierarchy.

---

## **MCP Tool Schema Examples**

### Example Action: List Network Requests

```ts
{
  "name": "listNetworkRequests",
  "arguments": {
    "type": "xhr",
    "status": 200,
    "contains": "offers"
  }
}
```

### Example Action: Query DOM

```ts
{
  "name": "querySelectorAll",
  "arguments": {
    "selector": ".offer-card",
    "limit": 20,
    "attributes": ["href", "innerText"]
  }
}
```

---

## **LLM Workflow Example**

1. Navigate to target URL
2. Monitor network for JSON endpoints
3. Request DOM snapshot of target regions
4. Choose stable selectors
5. Generate a reusable scraping script in TS
6. Test selectors on multiple pages (if pagination)
7. Output structured results

---

## **Error Handling Strategy**

* Expose structured errors
* Include stack traces
* Inform LLM of transient failures

Example:

```json
{
  "error": "SelectorNotFound",
  "selector": ".price",
  "attempts": 3
}
```

---

## **Future Extensions**

* PDF downloading
* File metadata extraction
* Accessibility tree scraping
* Snapshot diff detection
* Session replay

---

## **Security Considerations**

* Do not allow navigation to `localhost` ports
* Disable downloads by default
* Sanitize file output paths
* Strip sensitive request headers

---

## **Technology Stack**

**Language**: TypeScript
**Browser Automation**: Puppeteer
**Protocol**: MCP
**State Storage**: In-memory map
**Parser Tools**:

* DOM traversal utilities
* CSS/XPath generator libraries

---

## **Folder Structure (Proposed)**

```
/src
  /mcp
    actions/
    schemas/
    router.ts
  /browser
    BrowserManager.ts
    PageManager.ts
    NetworkTracker.ts
    DomInspector.ts
  utils/
  index.ts
  types.ts
```

---

## **Success Criteria**

✅ The LLM can:

* Inspect network calls
* Read DOM structure safely
* Navigate tabs
* Identify stable selectors
* Generate robust scripts

✅ The agent:

* Avoids full DOM dumps
* Uses API endpoints when possible
* Extracts structured results reliably

---

## **End Goal**

A fully autonomous scraping assistant that can:

* Discover data sources
* Generate resilient extraction logic
* Produce TypeScript/Node scripts
* Handle dynamic web apps

---

### **Ready to Build**

Now Cursor AI has:

* Global context
* Architecture
* Best-practice heuristics
* Risks
* Workflows
* Expected APIs

This file should power smart context-aware coding assistance.

Let me know when you're ready for:

* Code scaffolding
* MCP action definitions
* Puppeteer wrapper implementations
* Selector heuristics
* JSON schema contracts
