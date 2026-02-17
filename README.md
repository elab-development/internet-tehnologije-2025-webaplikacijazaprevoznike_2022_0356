# B2B Platform (Uvoznici)

Web aplikacija za B2B saradnju između dobavljača i uvoznika. Supplieri nude proizvode, importeri kreiraju kontejnere i dodaju proizvode od odobrenih dobavljača. Administratorska uloga omogućava pregled sistema.

## Uloge

| Uloga | Opis |
|-------|------|
| **Admin** | Pregled svih saradnji (supplier ↔ importer). Upravljanje kategorijama. |
| **Supplier** | Dodavanje proizvoda, slanje zahteva za saradnju importerima. |
| **Importer** | Prihvatanje/odbijanje zahteva za saradnju, pregled proizvoda od odobrenih suppliera, kreiranje kontejnera i dodavanje proizvoda u njih. |

**Tok saradnje:** Supplier šalje zahtev importeru → Importer odobrava ili odbija → Posle odobrenja, importer vidi proizvode tog suppliera i može da ih dodaje u kontejnere.

---

## Tech stack

| Sloj | Tehnologije |
|------|-------------|
| **Frontend** | React 19, Vite 5, React Router |
| **Backend** | Node.js, Express 5 |
| **Baza** | PostgreSQL 16, Prisma ORM |
| **Auth** | JWT, bcrypt |
| **Deploy** | Docker, Docker Compose |

---

## Pokretanje uz Docker

### Preduslov

- [Docker](https://docs.docker.com/get-docker/) i [Docker Compose](https://docs.docker.com/compose/install/)

### Komanda

Iz root foldera projekta:

```bash
docker compose up --build
```

Za pozadinsko izvršavanje:

```bash
docker compose up --build -d
```

### Servisi i URL-ovi

| Servis | Port | URL |
|--------|------|-----|
| **Frontend** | 3000 | http://localhost:3000 |
| **Backend API** | 4000 | http://localhost:4000 |
| **Swagger (API dokumentacija)** | 4000 | http://localhost:4000/api-docs |
| **PostgreSQL** | 5432 | localhost:5432 (korisnik: `app`, baza: `uvoznici`) |

---

## Pokretanje lokalno (bez Dockera)

### Preduslov

- Node.js 18+  
- PostgreSQL 16 (na `localhost:5432` ili prilagoditi `DATABASE_URL`)

### 1. Baza

PostgreSQL mora da radi sa bazom `uvoznici`. Kreiraj bazu i korisnika ako ne postoje (npr. korisnik `app`, lozinka `app`).

Primeni Prisma migracije:

```bash
cd backend
npx prisma migrate deploy
```

### 2. Backend

```bash
cd backend
npm install
```

Kreiraj fajl `.env` u `backend/` (ili kopiraj iz `.env.example` ako postoji):

```env
DATABASE_URL=postgresql://app:app@localhost:5432/uvoznici
JWT_SECRET=your-secret-key-change-this
PORT=4000
FRONTEND_URL=http://localhost:5173
```

Pokreni:

```bash
npm run dev
```

ili za produkciju:

```bash
npm start
```

Backend radi na http://localhost:4000.

### 3. Frontend

U novom terminalu:

```bash
cd frontend
npm install
```

Opciono, kreiraj `.env` ako želiš da promeniš API URL:

```env
VITE_API_URL=http://localhost:4000
```

Pokreni dev server:

```bash
npm run dev
```

Vite će servirati aplikaciju na http://localhost:5173 (ili drugi port ako je 5173 zauzet).

---

## Environment varijable

### Backend (`backend/.env`)

| Varijabla | Opis | Primer |
|-----------|------|--------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://app:app@localhost:5432/uvoznici` |
| `JWT_SECRET` | Tajni kljuch za JWT potpis | `neki-dugacak-tajni-kljuc` |
| `PORT` | Port na kome sluša API | `4000` |
| `FRONTEND_URL` | CORS origin za frontend | `http://localhost:5173` ili `http://localhost:3000` |

### Frontend (`frontend/.env`)

| Varijabla | Opis | Primer |
|-----------|------|--------|
| `VITE_API_URL` | Base URL backend API-ja | `http://localhost:4000` |

**Napomena:** U Dockeru `VITE_API_URL` se prosleđuje kao build arg (`http://localhost:4000`), jer se frontend iz browsera direktno obraća hostu.

---

## Swagger (API dokumentacija)

- **URL:** http://localhost:4000/api-docs  
- Backend mora da radi da bi stranica bila dostupna.

Za zaštićene rute:

1. Uloguj se preko `POST /auth/login`.  
2. Kopiraj `token` iz odgovora.  
3. U Swagger UI klikni **Authorize** → unesi token (samo vrednost, bez prefiksa "Bearer").  
4. Nakon toga možeš pozivati sve zaštićene endpoint-e.

---

## Test podaci

U folderu `backend/prisma/` nalaze se SQL skripte za seed podatke:

- `seed-po-tabelama/` – skripte po tabelama (01-category, 02-product, 03-collaboration, 04-container, 05-container-item). Redom pokrenuti u pgAdminu ili `psql`.  
- `seed-samo-podaci.sql` – ceo seed (briše sve osim User, pa ubacuje kategorije, proizvode, saradnje, kontejnere, stavke).  
- `seed-za-testiranje.sql` – kompletni seed uklljučujući korisnike (lozinka za sve: `password`).

Za lokalnu bazu ili prvu inicijalizaciju Docker baze, prvo pokreni Prisma migracije, pa zatim željenu seed skriptu.

### Mapa (lokacije suppliera i importera)

Stranica **Map** prikazuje lokacije korisnika (SUPPLIER/IMPORTER) na Google Mapi. Da bi korisnici imali koordinate:

1. Pokreni SQL skriptu `backend/prisma/add-user-location-serbia.sql` u pgAdminu ili `psql`. Skripta dodaje kolone `latitude` i `longitude` u tabelu `User` i popunjava ih nasumičnim koordinatama unutar Srbije.
2. U frontend `.env` postavi `VITE_GOOGLE_MAPS_API_KEY=<tvoj Google Maps API ključ>` (Maps JavaScript API). Bez ključa mapa se ne učitava.

---

## Troubleshooting

### Port već u upotrebi

Ako neki od portova (3000, 4000, 5432) već koristi drugi proces:

- Za Docker: izmeni mapiranje u `docker-compose.yml`, npr. `"3001:80"` umesto `"3000:80"` za frontend.  
- Za lokalno: pokreni backend/frontend na drugom portu ili zaustavi proces koji drži port.

### Konflikt imena kontejnera

Ako dobiješ grešku tipa `container name already in use`:

```bash
docker compose down
docker compose up --build
```

Ili ručno ukloni kontejnere:

```bash
docker rm -f uvoznici_db uvoznici_backend uvoznici_frontend
```

### Backend ne vidi bazu u Dockeru

U Docker Compose-u backend koristi hostname `postgres` za bazu (servis), ne `localhost`:

```yaml
DATABASE_URL: postgresql://app:app@postgres:5432/uvoznici
```

Lokalno koristi `localhost`:

```
DATABASE_URL=postgresql://app:app@localhost:5432/uvoznici
```

### Migracije nisu primenjene

Posle prvog pokretanja Docker stack-a, ako baza nema tabele:

```bash
docker compose exec backend npx prisma migrate deploy
```

Ili ručno pokreni migracije iz `backend/prisma/migrations/` nad Docker bazu (host: localhost, port: 5432).

### CORS greške

Proveri da `FRONTEND_URL` u backend `.env` odgovara URL-u na kome frontend radi (npr. `http://localhost:5173` za Vite dev, `http://localhost:3000` za Docker frontend).

### JWT_SECRET nije setovan

Ako login vraća 500 ili "Server configuration error", backendu nedostaje `JWT_SECRET`. Dodaj ga u `backend/.env`.

---

## Licenca

ISC
