# AccessCheck — Live Web Accessibility & Contrast Monitor 🔍

**AccessCheck** is an automated, real-time web accessibility evaluation platform. It ensures web interfaces conform to the official **W3C WCAG 2.1 (Web Content Accessibility Guidelines)** standards by actively monitoring color contrast, form accessibility, interactive element labels, and page structure.

Unlike traditional static checkers that require manual page rescans or report inaccurate contrast due to transparent backgrounds, AccessCheck features a native **`MutationObserver` engine** that recalculates compliance dynamically as styles and DOM elements change, paired with a **live URL scanner** capable of auditing external websites.

---

## 🚀 Key Features

### 1. Dynamic DOM & Style Monitoring (`MutationObserver`)
- **Zero-Click Recalculation:** Actively observes the DOM subtree for changes to `style` attributes, CSS classes, inline styling, and element additions/removals.
- **Dynamic Issue Lifecycle:** When a design issue is fixed, it **automatically disappears** from the dashboard. When a new violation is introduced, it **instantly appears** without requiring a manual "Recheck" click.
- **Smart Debouncing:** Batches high-frequency style updates (such as real-time color picker adjustments) with a 350ms debounce window to ensure zero layout lag.

### 2. Precise WCAG 2.1 Contrast Calculation Engine
- **Mathematical Accuracy:** Computes relative luminance ($L$) following the exact WCAG 2.1 sRGB gamma formula:
  $$L = 0.2126 \times R_{\text{lin}} + 0.7152 \times G_{\text{lin}} + 0.0722 \times B_{\text{lin}}$$
  $$\text{Contrast Ratio} = \frac{L_{\text{lighter}} + 0.05}{L_{\text{darker}} + 0.05}$$
- **Effective Background Resolution:** Traverses the DOM hierarchy to resolve true rendered backgrounds behind transparent or semi-transparent parent containers.
- **Strict Compliance Levels:**
  - **Level AA Normal Text:** Minimum $4.50:1$
  - **Level AA Large Text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold):** Minimum $3.00:1$
  - **Level AAA Normal Text:** Minimum $7.00:1$
  - **Level AAA Large Text:** Minimum $4.50:1$
  - **UI Controls & Graphical Objects:** Minimum $3.00:1$

### 3. Server-Side Live URL Scanner
- **CORS Bypass:** Audits external websites without browser Cross-Origin Resource Sharing (CORS) restrictions.
- **Full-Spectrum Accessibility Audit:**
  - **Color Contrast (WCAG 1.4.3):** Inspects inline styles, embedded `<style>` blocks, and document-level background inheritance.
  - **Accessible Names (WCAG 4.1.2):** Validates `<button>`, `<a href>`, and action controls for inner text, `aria-label`, or accessible names.
  - **Image Alternatives (WCAG 1.1.1):** Flags missing `alt` attributes while respecting decorative `alt=""`.
  - **Form Controls (WCAG 1.3.1):** Confirms associations with explicit `<label for="...">`, parent `<label>`, or `aria-label`.
  - **Document Structure (WCAG 3.1.1 & 2.4.2):** Verifies `<html>` `lang` attributes, `<title>` tags, and responsive viewport configuration.
- **Resilient Error Categorization:** Accurately distinguishes and reports:
  - Invalid URLs & hostnames
  - Network timeouts and DNS failures
  - Access-blocked requests (HTTP 401 / 403 / Cloudflare bot protection)
  - Target server HTTP errors (404, 500, 502)
  - Parsing failures or blank responses
- **Zero-Element Protection:** Never falsely reports a 100% health score when zero auditable elements are detected (e.g., SPAs with empty initial HTML); provides actionable diagnostics instead.

### 4. Interactive Developer Playground & Remediation
- **Interactive Northstar Demo Site:** Built-in live website preview with developer controls to adjust headings, body text, button colors, and input accessibility labels in real time.
- **✦ One-Click Suggested Remediation:** Instantly calculates and applies compliant color alternatives meeting minimum WCAG threshold ratios.
- **Clipboard Fix Export:** One-click copy for ready-to-paste CSS fixes.

---

## 💻 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (Node Package Manager)

### Installation
```bash
# Clone or navigate to the project directory
cd grevix

# Install dependencies
npm install
```

### Running Locally
```bash
# Start local Vite development server
npm run dev
```
Open your browser at **`http://localhost:3000`**. The Vite server provides live hot-reloading and proxy middleware for `/api/scan`.

---

## 🧪 Verification & Testing

AccessCheck includes both unit and end-to-end headless browser test suites:

### 1. Mathematical Unit Tests
Verifies WCAG contrast formulas and baseline states against standard reference colors:
```bash
npm test
```

### 2. Full End-to-End Headless Browser Verification
Launches a real headless Chrome instance to test `MutationObserver` triggers, real-time debouncing, live URL scanning, and error handling:
```bash
node --experimental-websocket verify-live.js
```

---

## 🛠️ Production Build & Deployment

### Build for Production
```bash
npm run build
```
This generates optimized, production-ready static assets in the `dist/` directory, including:
- `dist/index.html` (Application frontend and offline scanner fallback)
- `dist/test-contrast.html` (Built-in test fixture containing verified contrast violations)
- `dist/_redirects` (Routing configuration for Netlify serverless functions)

### Deployment Options

#### Option A: Netlify (Recommended)
1. Log in to [Netlify](https://app.netlify.com).
2. Go to your site dashboard > **Deploys**.
3. Drag and drop the `dist/` folder into the deploy drop zone.
4. The application automatically detects Netlify Functions (`netlify/functions/scan.js`) and routes requests via `netlify.toml` / `_redirects`. If deployed as a purely static site, the built-in client-side crawler seamlessly handles external URL scans.

#### Option B: Standalone Node.js Server
Run the production Node server:
```bash
npm start
# or: node server.js
```
The server serves static production assets from `dist/` while exposing the live Cheerio crawler on `/api/scan`.

---

## 📁 Project Structure

```text
grevix/
├── index.html                   # Core application frontend & live preview UI
├── package.json                 # Project configuration, scripts & dependencies
├── vite.config.js               # Vite config with integrated /api/scan dev plugin
├── server.js                    # Standalone Node.js production server
├── test-audit.js                # Mathematical WCAG contrast verification tests
├── verify-live.js               # End-to-end headless Chrome verification suite
├── netlify.toml                 # Netlify deployment and function routing config
├── _redirects                   # Netlify redirect rules (/api/scan -> function)
├── public/
│   ├── _redirects               # Bundled into dist during build
│   └── test-contrast.html       # Public test fixture with known contrast issues
├── netlify/
│   └── functions/
│       └── scan.js              # Netlify Serverless Function for live URL scanning
└── src/
    ├── server/
    │   └── scanner.js           # Cheerio-based website crawler & WCAG auditor
    └── utils/
        ├── wcag.js              # WCAG 2.1 relative luminance & contrast algorithms
        └── accessibilityChecker.js # Element audit engine & scoring
```

---

## 📜 Standards & Compliance Reference

- **WCAG 2.1 Success Criterion 1.4.3 (Contrast - Minimum):** Level AA text contrast
- **WCAG 2.1 Success Criterion 1.4.11 (Non-text Contrast):** UI components and graphics
- **WCAG 2.1 Success Criterion 4.1.2 (Name, Role, Value):** Button and link accessible names
- **WCAG 2.1 Success Criterion 1.1.1 (Non-text Content):** Image text alternatives
- **WCAG 2.1 Success Criterion 1.3.1 (Info and Relationships):** Form control labels
- **WCAG 2.1 Success Criterion 2.4.2 (Page Titled):** Document page title
- **WCAG 2.1 Success Criterion 3.1.1 (Language of Page):** Language declaration

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
