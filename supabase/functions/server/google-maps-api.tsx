/**
 * 🗺️ GOOGLE MAPS API - Service de géocodage et routing
 */

import { Hono } from 'npm:hono@4.6.14';

const app = new Hono();

app.get('/search', async (c) => {
  try {
    const query = c.req.query('query');
    if (!query) {
      return c.json({ error: 'Query required', results: [] }, 400);
    }

    console.log('🗺️ Google Maps search:', query);

    const apiKey = Deno.env.get('GOOGLE_MAPS_SERVER_API_KEY') || Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.warn('⚠️ Google Maps API key missing, falling back');
      return c.json({ error: 'API key not configured', results: [] }, 500);
    }

    // ✅ POSITION DE L'UTILISATEUR (si fournie)
    const userLat = c.req.query('lat');
    const userLng = c.req.query('lng');
    
    // 🇨🇩 COORDONNÉES DE KINSHASA (centre-ville)
    const kinshasaLat = userLat || '-4.3276';
    const kinshasaLng = userLng || '15.3136';
    
    // ✅ PARAMÈTRES GOOGLE MAPS AVEC RESTRICTION GÉOGRAPHIQUE
    const params = new URLSearchParams({
      query: `${query} Kinshasa`, // ⭐ Ajouter "Kinshasa" à la recherche
      location: `${kinshasaLat},${kinshasaLng}`, // ⭐ Centre de recherche
      radius: '50000', // ⭐ Rayon de 50km autour de Kinshasa
      key: apiKey
    });
    
    // 🇨🇩 RESTRICTION STRICTE À LA RDC (components=country:CD)
    // Note: components ne fonctionne pas avec textsearch, donc on utilise "region=cd"
    params.append('region', 'cd'); // ⭐ Biaiser vers la RDC
    
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`;
    
    console.log('🌍 Recherche avec location bias:', kinshasaLat, kinshasaLng);
    console.log('🔗 URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    const data = await response.json();

    console.log(`✅ Google Maps: ${data.results?.length || 0} résultats`);
    
    // ✅ FILTRAGE SUPPLÉMENTAIRE : Ne garder QUE les résultats à Kinshasa/RDC
    let filteredResults = data.results || [];
    
    if (filteredResults.length > 0) {
      filteredResults = filteredResults.filter((place: any) => {
        const address = place.formatted_address || '';
        const isInDRC = 
          address.toLowerCase().includes('kinshasa') ||
          address.toLowerCase().includes('democratic republic of the congo') ||
          address.toLowerCase().includes('congo-kinshasa') ||
          address.toLowerCase().includes('rdc') ||
          address.toLowerCase().includes('rd congo');
        
        if (!isInDRC) {
          console.log(`🚫 Résultat filtré (hors RDC): ${place.name} - ${address}`);
        }
        
        return isInDRC;
      });
      
      console.log(`🇨🇩 Après filtrage RDC: ${filteredResults.length} résultats`);
    }
    
    // ✅ TRANSFORMER EN FORMAT STANDARDISÉ
    const transformedResults = filteredResults.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      description: place.formatted_address,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      placeId: place.place_id,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      types: place.types,
      source: 'google_maps'
    }));

    return c.json({ results: transformedResults });
  } catch (error) {
    console.error('❌ Google Maps error:', error);
    return c.json({ error: 'Search failed', results: [] }, 500);
  }
});

app.get('/reverse', async (c) => {
  try {
    const lat = c.req.query('lat');
    const lng = c.req.query('lng');
    
    if (!lat || !lng) {
      return c.json({ error: 'Lat/lng required' }, 400);
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_SERVER_API_KEY') || Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'API key not configured' }, 500);
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log('✅ Google Maps reverse geocoding');

    return c.json({ result: data.results?.[0] || null });
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    return c.json({ error: 'Reverse geocoding failed' }, 500);
  }
});

export default app;
