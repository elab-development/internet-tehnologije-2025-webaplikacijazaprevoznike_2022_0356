# B2B Platform (Uvoznici)

Web aplikacija za B2B saradnju (suppliers, importers, admin). Backend (Node/Express, Prisma, PostgreSQL), frontend (React/Vite).

---

## Dockerization

Aplikacija se može pokrenuti kao kompletan stack pomoću Docker Compose.

### Kako pokrenuti

Iz root foldera projekta:

```bash
docker compose up --build
```

Prvi put će se izgraditi sve slike; zatim se podižu svi servisi. Za pozadinsko izvršavanje koristite `docker compose up --build -d`.

### Servisi

| Servis     | Opis                          | Port na hostu |
|-----------|---------------------------------|----------------|
| **postgres** | PostgreSQL 16 baza (korisnici, proizvodi, kategorije, kontejneri, saradnje) | `5432` |
| **backend**  | Node/Express API (auth, products, categories, collaborations, containers, compare) | `4000` |
| **frontend** | React (Vite) build serviran preko nginx-a | `3000` |

- Backend zavisi od postgres-a (čeka da baza bude spremna pre starta).
- Frontend zavisi od backend-a i pri build-u je podešen da API zove na `http://localhost:4000`.

### Pristup aplikaciji

- **Aplikacija (UI):** http://localhost:3000  
- **API:** http://localhost:4000  
- **Baza:** `localhost:5432` (korisnik `app`, baza `uvoznici`)

### Screenshot (opciono)

<!-- TODO: Dodaj screenshot: terminal sa `docker compose up --build` ili Docker Desktop sa tri pokrenuta kontejnera -->
*Caption: Stack pokrenut sa `docker compose up --build` – postgres, backend i frontend kontejneri.*

---

## Swagger (API dokumentacija)

API je dokumentovan u OpenAPI 3 formatu i dostupan preko Swagger UI.

### Gde pristupiti

- **URL:** http://localhost:4000/api-docs  
- Backend mora da radi (lokalno ili u Dockeru na portu 4000).

### Šta je dokumentovano

U Swagger UI prikazani su svi glavni endpointi, uključujući:

- **Auth:** `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- **Categories:** `GET /categories`, `POST /categories`, `DELETE /categories/:id`
- **Products:** `GET /products`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`
- **Collaborations:** rute za saradnju supplier–importer
- **Containers:** kreiranje kontejnera, dodavanje stavki, pregled
- **Importer:** `GET /importer/products`
- **Compare:** upoređivanje proizvoda po kategoriji

Za zaštićene rute u opisu je navedeno da zahtevaju Bearer JWT.

### Autorizacija Bearer tokenom u Swagger UI

1. Ulogujte se preko `POST /auth/login` (email + password) i u odgovoru kopirajte vrednost polja `token`.
2. U Swagger UI kliknite **Authorize** (gore desno).
3. U polje za **Bearer** nalepite token (samo vrednost, bez reči "Bearer").
4. Kliknite **Authorize**, zatim **Close**. Svi sledeći pozivi ka zaštićenim endpointima će u headeru slati `Authorization: Bearer <token>`.

### Screenshot (opciono)

<!-- TODO: Dodaj screenshot: Swagger UI na /api-docs sa otvorenim Authorize dijalogom -->
*Caption: Swagger UI na /api-docs – Authorize dijalog za unos JWT tokena.*

### Kratak izvod koda – Swagger setup i Bearer shema

API dokumentacija se uključuje u Express aplikaciju preko `swagger-jsdoc` (čita JSDoc iz ruta) i `swagger-ui-express` (servira UI). Bearer JWT shema je definisana u OpenAPI konfiguraciji i koristi se na zaštićenim rutama:

```javascript
// backend/app.js – mount Swagger UI
const swaggerSpec = swaggerJsdoc({
  definition: openapiConfig,
  apis: [path.join(__dirname, 'src/routes/*.js')],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

```javascript
// backend/openapi.config.js – Bearer auth shema za Swagger
components: {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT from POST /auth/login',
    },
  },
  // ...
}
```

Zaštita ruta u kodu vrši se u middleware-u `auth`: proverava se header `Authorization: Bearer <token>`, JWT se verifikuje pomoću `JWT_SECRET`, a dekodirani `id` i `role` stavljaju se u `req.user` za dalju autorizaciju (npr. po ulozi).
