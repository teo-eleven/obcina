# 0001. Stack: Vite + React + Firebase + Vercel

Date: 2026-10-30

## Status

Accepted

## Context

Proiect individual, 2 luni, notat pe: min. 5 produse, branding, coș funcțional, simulare de
plată, design responsive. Platformele permise: WooCommerce, Shopify sau Firebase + frontend.
Vrem să construim noi logica (nu doar să configurăm o temă) și să avem un link live la demo.

## Decision

- Frontend: Vite + React + TypeScript (strict) + Tailwind CSS v4.
- Date și autentificare: Firebase (Firestore + Auth), planul gratuit Spark.
- Hosting și funcții de server: Vercel (frontend + `/api`), un singur deploy.
- Teste: Vitest + Testing Library; Playwright pentru E2E (săpt. 8).
- Lint: oxlint (vine cu șablonul Vite), Prettier pentru formatare.

Respins: Next.js (SSR nu ne trebuie, adaugă complexitate), Firebase Cloud Functions (cer
planul Blaze, cu card).

## Consequences

- Tot codul de server stă în `api/` pe Vercel; Firebase e folosit doar ca bază de date și auth.
- Funcțiile Vercel accesează Firestore cu `firebase-admin` și un service account (secret de server).
- SEO limitat (SPA), acceptabil pentru un magazin demonstrativ.
