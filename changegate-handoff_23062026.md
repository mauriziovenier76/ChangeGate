# ChangeGate — Handoff Document
**Sessione:** "Redesign changegate.braingifted.com con Next.js"  
**Data ultimo aggiornamento:** 23 giugno 2026

---

## Stack tecnico

| Componente | Tecnologia |
|---|---|
| Framework | Next.js (App Router) |
| Linguaggio | TypeScript |
| Database / Auth | Supabase (progetto **dedicato** a ChangeGate) |
| Deploy | Vercel |
| DNS | Cloudflare |
| Source control | GitHub |
| URL produzione | changegate.braingifted.com |

> ⚠️ Il progetto Supabase è stato migrato a un'istanza dedicata (separata da braingifted.com) perché condividevano `auth.users`. La migrazione è completata.

---

## Struttura del progetto (app/)

```
app/
├── layout.tsx              ← root layout con Topbar
├── page.tsx                ← redirect a /dashboard
├── dashboard/page.tsx      ← dashboard con card statistiche
├── requests/page.tsx       ← tabella CR con accordion + sticky cols
├── config/
│   ├── fornitori/page.tsx
│   ├── clienti/page.tsx
│   ├── progetti/page.tsx
│   └── utenti/page.tsx
├── login/page.tsx
└── api/
    └── (setup-admin era qui — ora ELIMINATO)

lib/
└── user-context.tsx        ← UserContext React provider con flag permessi per ruolo
```

---

## Design system

- **Topbar scura** — 56px altezza, navigazione orizzontale
- **Layout full-width** — `maxWidth` rimosso da tutte le pagine
- **Tabella CR** — accordion raggruppato per progetto, sticky colonne sinistra, scroll orizzontale
- **Colori ambienti:**
  - Test → lilac `#d8bfd8`
  - Produzione → blue `#dbeafe`
- **Font:** DM Sans (Google Fonts CDN)
- `Sidebar.tsx` è obsoleto e può essere eliminato

---

## Sistema a 5 ruoli (progettato, parzialmente implementato)

| Ruolo | Lato | Permessi principali |
|---|---|---|
| **ADMIN** | Fornitore | Dashboard globale, crea Fornitore/Cliente/PM Fornitore. NON gestisce progetti né CR. |
| **PM_FORNITORE** | Fornitore | Gestisce progetti (clienti del proprio fornitore), crea/modifica CR, crea utenti fornitore e PM Cliente. |
| **PS_FORNITORE** | Fornitore | Modifica solo CR assegnati a sé. Nessuna gestione utenti/progetti. |
| **PM_CLIENTE** | Cliente | Visualizza propri CR, crea KU Cliente. |
| **KU_CLIENTE** | Cliente | Solo visualizzazione CR propri. |

**PM visibility rule (da implementare):**
- PM associato a un **progetto** → vede tutti i CR del progetto
- PM associato a singoli **CR** → vede solo quei CR

**Stato attuale implementazione:**
- `UserContext` (`lib/user-context.tsx`) con flag di permesso per ruolo ✅
- Topbar filtra voci di menu per ruolo (Admin non vede CR, Planning, Clienti, Progetti) ✅
- Pagina Utenti: raggruppata per fornitore, Admin crea solo PM Fornitore ✅
- Enforcement completo su tutte le pagine → **da completare**

---

## Pattern tecnici critici (da non dimenticare)

```tsx
// 1. "use client" obbligatorio su ogni pagina con hook o event handler
"use client";

// 2. Cast TypeScript per relazioni Supabase — passare sempre per unknown
const fornitore = data.fornitore as unknown as { nome: string };

// 3. buildGrid() deve essere definita a livello modulo, NON dentro il componente
function buildGrid(...) { ... }
export default function Page() { ... }

// 4. Guard ambiente — se entrambi i filtri sono false il browser crasha
{(showTest || showProd) && (
  <div style={{ gridColumn: "span 8" }}>...</div>
)}
```

---

## Admin setup (completato)

- La rotta `/api/setup-admin` è stata **eliminata** dalla produzione dopo aver creato l'utente admin.
- La pagina `/setup` e `/test-supabase` sono state **eliminate**.
- Non ricreare queste rotte.

---

## Lavoro rimasto (backlog)

- [ ] Enforcement completo permessi role-based su tutte le pagine e le view
- [ ] Implementare PM visibility rule (progetto vs CR singoli)
- [ ] PS Fornitore: limitare editing ai soli CR assegnati
- [ ] PM Cliente / KU Cliente: view sola lettura dei propri CR
- [ ] Pagina Planning (non ancora sviluppata)
- [ ] Gestione modale "Modifica" su tabella Fornitori (bottone presente, logica mancante)

---

## Come riprendere in una nuova chat

Incolla questo documento come primo messaggio e aggiungi:

> "Stiamo continuando lo sviluppo di ChangeGate. Leggi il documento allegato come contesto. Voglio lavorare su: [descrivi il prossimo task]"

Poi allega o incolla i file `.tsx` rilevanti per il task specifico.
