// Cache per le coordinate delle localita (per evitare troppe richieste)
const coordinatesCache = new Map()

// Funzione per ottenere le coordinate di una localita usando Nominatim (OpenStreetMap)
export async function getCoordinates(locality) {
  if (!locality || locality.trim() === '') {
    return null
  }

  const normalizedLocality = locality.trim().toLowerCase()

  // Controlla se abbiamo gia le coordinate in cache
  if (coordinatesCache.has(normalizedLocality)) {
    return coordinatesCache.get(normalizedLocality)
  }

  try {
    // Aggiungi "Italia" per migliorare i risultati
    const searchQuery = `${locality}, Italia`
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      {
        headers: {
          'User-Agent': 'OratoriGestionale/1.0',
        },
      }
    )

    if (!response.ok) {
      console.error('Errore geocoding:', response.status)
      return null
    }

    const data = await response.json()

    if (data && data.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      }
      coordinatesCache.set(normalizedLocality, coords)
      return coords
    }

    // Se non trova risultati, salva null in cache per evitare richieste ripetute
    coordinatesCache.set(normalizedLocality, null)
    return null
  } catch (error) {
    console.error('Errore durante geocoding:', error)
    return null
  }
}

// Formula Haversine per calcolare la distanza tra due punti sulla Terra
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Raggio della Terra in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg) {
  return deg * (Math.PI / 180)
}

// Funzione principale per calcolare la distanza tra due localita
export async function getDistanceBetweenLocalities(locality1, locality2) {
  if (!locality1 || !locality2) {
    return null
  }

  // Se le localita sono uguali (case insensitive)
  if (locality1.trim().toLowerCase() === locality2.trim().toLowerCase()) {
    return 0
  }

  const coords1 = await getCoordinates(locality1)
  const coords2 = await getCoordinates(locality2)

  if (!coords1 || !coords2) {
    return null
  }

  const distance = calculateDistance(coords1.lat, coords1.lon, coords2.lat, coords2.lon)
  return Math.round(distance) // Arrotonda al km
}

// Funzione per formattare la distanza per la visualizzazione
export function formatDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) {
    return null
  }
  if (distanceKm === 0) {
    return 'Stessa citta'
  }
  if (distanceKm < 1) {
    return '< 1 km'
  }
  return `${distanceKm} km`
}
