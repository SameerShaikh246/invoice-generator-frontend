# Invoice Generator --- Frontend

A React + Vite frontend for creating, editing, saving, loading, and
emailing invoices.

**Live application:** https://invoice-generator-frontend-six.vercel.app/

## Features

-   Edit business and customer details.
-   Add and remove invoice line items.
-   Calculate line totals, subtotal, discount, tax, and grand total.
-   Add, edit, show, hide, and remove custom fields.
-   Save invoices and load previously saved invoices.
-   View saved invoice history.
-   Print an invoice or use the browser's print dialog to save it as a
    PDF.
-   Send invoice details to the backend for email delivery through
    Brevo.

## Technology

-   React
-   Vite
-   JavaScript
-   CSS
-   Fetch API for backend requests

## Requirements

-   Node.js and npm
-   A running instance of the Invoice Generator backend

## Local setup

From the repository root, open a terminal and run:

``` bash
cd frontend
npm install
```

Create a `frontend/.env` file:

``` env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is the base URL of the backend. Do not add a trailing
slash.

Start the development server:

``` bash
npm run dev
```

Vite prints the local URL in the terminal, usually
`http://localhost:5173`.

Create a production build:

``` bash
npm run build
```

Preview the production build locally:

``` bash
npm run preview
```

## Environment variables

  -------------------------------------------------------------------------------
  Variable          Required          Description       Example
  ----------------- ----------------- ----------------- -------------------------
  `VITE_API_URL`    Yes               Base URL for the  `http://localhost:5000`
                                      Invoice Generator 
                                      API               

  -------------------------------------------------------------------------------

### Vercel deployment

The frontend is deployed on Vercel.

1.  Open the Vercel project settings.
2.  Go to **Settings → Environment Variables**.
3.  Add `VITE_API_URL` and set it to the public Render backend URL, for
    example `https://YOUR-BACKEND.onrender.com`.
4.  Apply it to the required environments (Production and, if needed,
    Preview).
5.  Redeploy the frontend so the Vite build uses the updated value.

Replace the example URL with the actual backend URL. The `VITE_` prefix
means the value is included in the browser build, so only use it for
non-secret configuration such as the public API URL. **Never put API
keys, Supabase service-role keys, or other secrets in frontend
environment variables.**

## Backend API used by the frontend

The frontend calls these endpoints:

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  `GET`                   `/api/health`           Check API status and
                                                  whether the database is
                                                  configured

  `POST`                  `/api/invoices`         Save an invoice

  `GET`                   `/api/invoices`         Retrieve saved invoice
                                                  history

  `GET`                   `/api/invoices/:id`     Load one saved invoice

  `PUT`                   `/api/invoices/:id`     Update a saved invoice

  `POST`                  `/api/invoices/email`   Send invoice details by
                                                  email
  -----------------------------------------------------------------------

The backend validates invoice data and uses Supabase for persistence.
Email delivery is handled by the backend through Brevo.

## Project structure

``` text
frontend/
├── src/
│   ├── utils/
│   │   ├── api.js
│   │   └── invoiceCalculations.js
│   ├── App.jsx
│   └── ...
├── .env.example
├── package.json
└── README.md
```

The exact component/file layout may include additional files.

## Troubleshooting

-   **Network request fails:** confirm `VITE_API_URL` points to the live
    backend and that the backend health endpoint responds.
-   **Changes to environment variables do not appear:** rebuild/redeploy
    the Vercel project.
-   **Browser reports a CORS error:** check that the backend CORS
    configuration permits the deployed frontend origin.
-   **Invoice email fails:** inspect the backend logs; Brevo credentials
    and sender configuration are managed on the backend, not here.

## Security note

Do not commit `.env` files containing real credentials. Keep secrets on
the backend only.
