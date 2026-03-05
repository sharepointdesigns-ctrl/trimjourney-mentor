# Apex Consulting — Business Consulting Website

A complete, production-ready **Business Consulting Website** built with pure HTML, CSS, and vanilla JavaScript. Designed for deployment to **Azure Static Web Apps**.

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, services preview, why us, industries, testimonials, CTA |
| Services | `services.html` | Deep-dive on all 6 service areas + engagement models |
| About | `about.html` | Story, values, timeline, leadership team, global offices |
| Case Studies | `case-studies.html` | 8 client case studies with filter tabs |
| Contact | `contact.html` | Inquiry form, FAQ accordion, contact details |

---

## Tech Stack

- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties, flexbox, grid, animations
- **Vanilla JS** — no frameworks, no dependencies
- **Azure Static Web Apps** — hosting and CI/CD

---

## Project Structure

```
/
├── index.html
├── services.html
├── about.html
├── case-studies.html
├── contact.html
├── staticwebapp.config.json     # Azure SWA routing & headers
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  # CI/CD pipeline
├── css/
│   ├── global.css               # Design tokens, layout, navbar, footer, buttons
│   ├── home.css                 # Home page styles
│   ├── services.css             # Services page styles
│   ├── about.css                # About page styles
│   ├── case-studies.css         # Case studies + filter styles
│   └── contact.css              # Contact form + FAQ styles
├── js/
│   └── main.js                  # Navbar, menu, filter, FAQ, form, animations
└── images/                      # Add your images here
```

---

## Deploying to Azure Static Web Apps

### Prerequisites
- An Azure account
- A GitHub repository containing this code

### Steps

1. **Create an Azure Static Web App:**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Search for **Static Web Apps** → Create
   - Select your GitHub repository and branch (`main`)
   - Set **App location** to `/`
   - Set **Output location** to `` (empty — no build step)
   - Click **Review + Create**

2. **Add the deployment token as a GitHub secret:**
   - Azure will generate an API token during creation
   - In your GitHub repo → Settings → Secrets → Actions
   - Add secret: `AZURE_STATIC_WEB_APPS_API_TOKEN` = *(your token)*

3. **Push to main — the GitHub Action deploys automatically.**

### Custom Domain
After deployment, go to your Static Web App in Azure Portal:
- **Custom domains** → Add → follow DNS verification steps

---

## Customization Checklist

- [ ] Replace `Apex Consulting` branding with your firm's name and logo
- [ ] Update contact details (email, phone, office addresses)
- [ ] Swap placeholder statistics with real metrics
- [ ] Replace team member names/bios with real leadership info
- [ ] Update case studies with real client stories (or anonymize)
- [ ] Connect the contact form to a real backend (Azure Function or email service)
- [ ] Add a favicon (`/images/favicon.ico`)
- [ ] Add Open Graph images for social sharing

---

## Connecting the Contact Form

The form currently simulates submission. To make it live:

### Option A — Azure Functions (recommended)
1. Create an Azure Function (HTTP trigger) that sends an email via SendGrid or Azure Communication Services
2. Update `js/main.js` — replace the `await new Promise(...)` simulation with:
```js
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
});
```

### Option B — Formspree / Netlify Forms
Replace the `<form>` action attribute with your Formspree endpoint.

---

## License

MIT — free to use and customize for any commercial or personal project.
