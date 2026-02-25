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
      
      // ⭐ UTILISER GOOGLE DISTANCE MATRIX API POUR LES VRAIES DISTANCES ROUTIÈRES
      // (comme Yango) au lieu de la distance à vol d'oiseau (Haversine)
      try {
        console.log(`🚗 Calcul des distances routières réelles avec Google Distance Matrix API...`);
        
        // Limiter à 25 destinations (limite de l'API)
        const destinations = filteredResults.slice(0, 25).map((place: any) => 
          `${place.geometry.location.lat},${place.geometry.location.lng}`
        ).join('|');
        
        const distanceMatrixUrl = new URLSearchParams({
          origins: `${userLat},${userLng}`,
          destinations,
          key: apiKey,
          mode: 'driving',
          language: 'fr'
        });
        
        const distanceResponse = await fetch(
          `https://maps.googleapis.com/maps/api/distancematrix/json?${distanceMatrixUrl.toString()}`
        );
        const distanceData = await distanceResponse.json();
        
        if (distanceData.status === 'OK' && distanceData.rows?.[0]?.elements) {
          const elements = distanceData.rows[0].elements;
          
          // Assigner les distances routières réelles
          filteredResults.slice(0, 25).forEach((place: any, index: number) => {
            const element = elements[index];
            if (element.status === 'OK') {
              // ✅ Distance routière en km (comme Yango)
              place.distance = element.distance.value / 1000;
              place.duration = element.duration.value / 60; // minutes
              
              console.log(`  📍 ${place.name}: ${place.distance.toFixed(1)} km, ${Math.round(place.duration)} min`);
            } else {
              // Fallback : Haversine
              const placeLat = place.geometry.location.lat;
              const placeLng = place.geometry.location.lng;
              
              const R = 6371;
              const dLat = (placeLat - userLatNum) * Math.PI / 180;
              const dLng = (placeLng - userLngNum) * Math.PI / 180;
              const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(userLatNum * Math.PI / 180) * Math.cos(placeLat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distance = R * c;
              
              place.distance = distance;
              console.log(`  📍 ${place.name}: ${distance.toFixed(1)} km (fallback Haversine)`);
            }
          });
          
          console.log(`✅ Distances routières calculées avec Google Distance Matrix API`);
        } else {
          console.warn(`⚠️ Distance Matrix API error: ${distanceData.status}, fallback Haversine`);
          
          // Fallback : Haversine pour tous
          filteredResults.forEach((place: any) => {
            const placeLat = place.geometry.location.lat;
            const placeLng = place.geometry.location.lng;
            
            const R = 6371;
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
        }
      } catch (error) {
        console.error('❌ Distance Matrix API error:', error, '- Fallback Haversine');
        
        // Fallback complet : Haversine
        filteredResults.forEach((place: any) => {
          const placeLat = place.geometry.location.lat;
          const placeLng = place.geometry.location.lng;
          
          const R = 6371;
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
      }
      
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

app.get('/directions', async (c) => {
  try {
    const origin = c.req.query('origin');
    const destination = c.req.query('destination');
    const waypoints = c.req.query('waypoints');
    
    if (!origin || !destination) {
      return c.json({ error: 'Origin and destination required' }, 400);
    }

    console.log('🚗 Google Directions API:', origin, '→', destination);

    const apiKey = Deno.env.get('GOOGLE_MAPS_SERVER_API_KEY') || Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.warn('⚠️ Google Maps API key missing');
      return c.json({ error: 'API key not configured' }, 500);
    }

    // Construire l'URL Google Directions API
    const params = new URLSearchParams({
      origin,
      destination,
      key: apiKey,
      mode: 'driving',
      departure_time: 'now', // Trafic en temps réel
      language: 'fr' // Français
    });
    
    if (waypoints) {
      params.append('waypoints', waypoints);
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;
    
    console.log('🌐 Requête Google Directions (API key cachée)');
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('❌ Google Directions error:', data.status, data.error_message);
      return c.json({ error: `Google Directions: ${data.status}` }, 500);
    }

    if (!data.routes || data.routes.length === 0) {
      console.error('❌ Aucun itinéraire trouvé');
      return c.json({ error: 'No routes found' }, 404);
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Extraire les coordonnées pour la polyline
    const coordinates: Array<{ lat: number; lng: number }> = [];
    leg.steps.forEach((step: any) => {
      coordinates.push({
        lat: step.start_location.lat,
        lng: step.start_location.lng
      });
    });
    // Ajouter le dernier point
    coordinates.push({
      lat: leg.end_location.lat,
      lng: leg.end_location.lng
    });

    // Construire la réponse au format attendu
    const routeResult = {
      distance: leg.distance.value / 1000, // Convertir mètres en km
      duration: leg.duration.value / 60,   // Convertir secondes en minutes
      coordinates,
      polyline: route.overview_polyline.points,
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Retirer HTML
        distance: step.distance.value / 1000, // km
        duration: step.duration.value / 60,   // min
        startLocation: step.start_location,
        endLocation: step.end_location
      }))
    };

    console.log(`✅ Itinéraire calculé: ${routeResult.distance.toFixed(1)} km, ${Math.round(routeResult.duration)} min`);

    return c.json({ route: routeResult });
  } catch (error) {
    console.error('❌ Directions error:', error);
    return c.json({ error: 'Directions calculation failed' }, 500);
  }
});

export default app;
