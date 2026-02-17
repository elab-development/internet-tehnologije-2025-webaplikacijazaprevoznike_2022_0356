let cachedCountries = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h

async function fetchAllCountries() {
  const now = Date.now();
  if (cachedCountries && now - cachedAt < CACHE_TTL_MS) {
    return cachedCountries;
  }

  const resp = await fetch('https://restcountries.com/v3.1/all');
  if (!resp.ok) {
    throw new Error('Failed to fetch countries');
  }
  const raw = await resp.json();

  const simplified = raw
    .filter((c) => c && c.cca2 && c.name && c.name.common)
    .map((c) => {
      const currencies = c.currencies
        ? Object.entries(c.currencies).map(([code, val]) => ({
            code,
            name: val.name,
            symbol: val.symbol ?? null,
          }))
        : [];
      return {
        code: c.cca2,
        name: c.name.common,
        capital: Array.isArray(c.capital) && c.capital.length ? c.capital[0] : null,
        timezones: Array.isArray(c.timezones) ? c.timezones : [],
        region: c.region ?? null,
        currencies,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  cachedCountries = simplified;
  cachedAt = now;
  return simplified;
}

async function listCountries(req, res, next) {
  try {
    const countries = await fetchAllCountries();
    return res.json(countries);
  } catch (e) {
    return next(e);
  }
}

async function getCountryByCode(req, res, next) {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ message: 'Code is required', code: 'VALIDATION_ERROR' });
    }
    const countries = await fetchAllCountries();
    const found = countries.find(
      (c) => c.code.toUpperCase() === String(code).toUpperCase()
    );
    if (!found) {
      return res.status(404).json({ message: 'Country not found', code: 'NOT_FOUND' });
    }
    return res.json(found);
  } catch (e) {
    return next(e);
  }
}

module.exports = { listCountries, getCountryByCode };

