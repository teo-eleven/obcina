# 0002. Plăți: Stripe Checkout în mod test

Date: 2026-10-30

## Status

Accepted

## Context

Cerința e „simulare de plată”. O simulare pur în frontend e acceptată, dar Stripe în mod
test arată un flux real (card acceptat, card refuzat, webhook) și e mai valoros la demo.

## Decision

- Stripe Checkout (pagina găzduită de Stripe), doar chei de test.
- `api/checkout` primește doar ID-uri de produs și cantități; **prețurile se recalculează pe
  server** din Firestore. Clientul nu trimite niciodată prețuri.
- O comandă devine `paid` **doar** din `api/webhook`, după verificarea semnăturii Stripe —
  nu pentru că utilizatorul a ajuns pe pagina de succes.
- Stocul scade într-o tranzacție Firestore, în webhook.
- Rezervă pentru demo: o plată simulată locală, pornită dintr-un flag, dacă Stripe nu răspunde.

## Consequences

- Avem nevoie de un backend minim (funcțiile Vercel), cu cheile Stripe doar ca variabile de mediu.
- Webhook-ul se testează local cu Stripe CLI (`stripe listen`).
