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
    
    // ⭐ STRATÉGIE DOUBLE : Recherche avec ET sans "Kinshasa"
    // Pour maximiser les résultats tout en gardant la restriction géographique
    const queries = [
      query, // Requête originale
      `${query} Kinshasa`, // Requête avec "Kinshasa"
      `${query} RDC` // Requête avec "RDC"
    ];
    
    let allResults: any[] = [];
    const seenPlaceIds = new Set<string>();
    
    // Essayer chaque variante de requête
    for (const searchQuery of queries) {
      console.log(`🔍 Essai requête: "${searchQuery}"`);
      
      // ✅ PARAMÈTRES GOOGLE MAPS AVEC RESTRICTION GÉOGRAPHIQUE
      const params = new URLSearchParams({
        query: searchQuery,
        location: `${kinshasaLat},${kinshasaLng}`, // ⭐ Centre de recherche
        radius: '50000', // ⭐ Rayon de 50km autour de Kinshasa
        key: apiKey
      });
      
      // 🇨🇩 RESTRICTION STRICTE À LA RDC
      params.append('region', 'cd'); // ⭐ Biaiser vers la RDC
      
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results?.length > 0) {
        console.log(`✅ "${searchQuery}": ${data.results.length} résultats`);
        
        // Ajouter seulement les nouveaux résultats (pas de doublons)
        for (const result of data.results) {
          if (!seenPlaceIds.has(result.place_id)) {
            seenPlaceIds.add(result.place_id);
            allResults.push(result);
          }
        }
      } else {
        console.log(`⚠️ "${searchQuery}": ${data.status} - ${data.results?.length || 0} résultats`);
      }
      
      // Si on a déjà assez de résultats, arrêter
      if (allResults.length >= 15) {
        console.log(`✅ Assez de résultats (${allResults.length}), arrêt des requêtes`);
        break;
      }
    }
    
    console.log(`📊 Total combiné: ${allResults.length} résultats uniques`);
    
    // ✅ FILTRAGE SUPPLÉMENTAIRE : Ne garder QUE les résultats à Kinshasa/RDC
    let filteredResults = allResults;
    
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
    
    // ✅ CALCUL DE LA DISTANCE depuis la position utilisateur
    if (userLat && userLng && filteredResults.length > 0) {
      const userLatNum = parseFloat(userLat);
      const userLngNum = parseFloat(userLng);
      
      filteredResults.forEach((place: any) => {
        const placeLat = place.geometry.location.lat;
        const placeLng = place.geometry.location.lng;
        
        // Formule Haversine pour calculer la distance
        const R = 6371; // Rayon de la Terre en km
        const dLat = (placeLat - userLatNum) * Math.PI / 180;
        const dLng = (placeLng - userLngNum) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(userLatNum * Math.PI / 180) * Math.cos(placeLat * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        place.distance = distance;
      });
      
      // Trier par distance
      filteredResults.sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999));
      
      console.log(`📏 Résultats triés par distance depuis (${userLat}, ${userLng})`);
    }
    
    // ✅ TRANSFORMER EN FORMAT STANDARDISÉ
    const transformedResults = filteredResults.slice(0, 20).map((place: any) => ({
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
      distance: place.distance,
      source: 'google_maps'
    }));
    
    console.log(`🎯 Retour de ${transformedResults.length} résultats au frontend`);
    if (transformedResults.length > 0) {
      console.log('📋 Top 5:', transformedResults.slice(0, 5).map((r: any) => 
        `${r.name} ${r.distance ? `(${r.distance.toFixed(1)}km)` : ''} ${r.rating ? `⭐${r.rating}` : ''}`
      ));
    }

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
