// controllers/mapController.js
const { dbPromise } = require('../config/database');
const axios = require('axios'); // npm install axios

class MapController {
  // Get all map points (lightweight - for fast loading)
  async getAllPoints(req, res) {
    try {
      const points = await dbPromise.all(
        'SELECT id, lat, lng, type, title FROM map_points WHERE active = 1'
      );
      
      res.json({ 
        success: true, 
        points: points.map(p => ({
          id: p.id,
          lat: p.lat,
          lng: p.lng,
          type: p.type,
          title: p.title
        }))
      });
    } catch (error) {
      console.error('Error getting points:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Get detailed information for a specific point
  async getPointDetails(req, res) {
    try {
      const { id } = req.params;
      const point = await dbPromise.get(
        `SELECT p.*, 
                GROUP_CONCAT(DISTINCT pi.image_url) as images,
                GROUP_CONCAT(DISTINCT pf.fact) as fun_facts
         FROM map_points p
         LEFT JOIN point_images pi ON p.id = pi.point_id
         LEFT JOIN point_facts pf ON p.id = pf.point_id
         WHERE p.id = ?
         GROUP BY p.id`,
        [id]
      );
      
      if (!point) {
        return res.status(404).json({ success: false, error: 'Point not found' });
      }
      
      // If point has coordinates, get Street View image from Google Maps
      if (point.lat && point.lng && process.env.GOOGLE_MAPS_API_KEY) {
        const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${point.lat},${point.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        point.streetViewImage = streetViewUrl;
        
        // Optionally get place details from Google Places API
        if (point.google_place_id) {
          const placeDetails = await this.getGooglePlaceDetails(point.google_place_id);
          point.googleData = placeDetails;
        }
      }
      
      res.json({ success: true, point });
    } catch (error) {
      console.error('Error getting point details:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Get points filtered by type (service, tower, entrance, etc.)
  async getPointsByType(req, res) {
    try {
      const { type } = req.params;
      const points = await dbPromise.all(
        'SELECT id, lat, lng, title, type, description FROM map_points WHERE type = ? AND active = 1',
        [type]
      );
      res.json({ success: true, points });
    } catch (error) {
      console.error('Error getting points by type:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Get Google Maps Places API details
  async getGooglePlaceDetails(placeId) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
        params: {
          place_id: placeId,
          fields: 'name,rating,reviews,opening_hours,photo,formatted_address,website',
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });
      
      return response.data.result;
    } catch (error) {
      console.error('Google Places API error:', error);
      return null;
    }
  }
  
  // Geocode address to coordinates (convert address to lat/lng)
  async geocodeAddress(req, res) {
    try {
      const { address } = req.query;
      
      if (!address) {
        return res.status(400).json({ success: false, error: 'Address required' });
      }
      
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });
      
      if (response.data.status === 'OK') {
        const location = response.data.results[0].geometry.location;
        res.json({
          success: true,
          lat: location.lat,
          lng: location.lng,
          formattedAddress: response.data.results[0].formatted_address
        });
      } else {
        res.status(404).json({ success: false, error: 'Address not found' });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Calculate route between two points (for directions)
  async getDirections(req, res) {
    try {
      const { origin, destination, mode = 'walking' } = req.query;
      
      if (!origin || !destination) {
        return res.status(400).json({ success: false, error: 'Origin and destination required' });
      }
      
      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin: origin,
          destination: destination,
          mode: mode,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });
      
      if (response.data.status === 'OK') {
        const route = response.data.routes[0];
        const leg = route.legs[0];
        
        res.json({
          success: true,
          distance: leg.distance.text,
          duration: leg.duration.text,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          polyline: route.overview_polyline.points,
          steps: leg.steps.map(step => ({
            instruction: step.html_instructions,
            distance: step.distance.text,
            duration: step.duration.text
          }))
        });
      } else {
        res.status(404).json({ success: false, error: 'Route not found' });
      }
    } catch (error) {
      console.error('Directions error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Get static map image from Google Maps
  async getStaticMap(req, res) {
    try {
      const { center, zoom = 15, width = 600, height = 400 } = req.query;
      
      if (!center) {
        return res.status(400).json({ success: false, error: 'Center coordinates required' });
      }
      
      const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${width}x${height}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      
      res.json({
        success: true,
        mapUrl: mapUrl
      });
    } catch (error) {
      console.error('Static map error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Get points of interest nearby (using Google Places API)
  async getNearbyPlaces(req, res) {
    try {
      const { lat, lng, radius = 500, type = 'tourist_attraction' } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ success: false, error: 'Latitude and longitude required' });
      }
      
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: {
          location: `${lat},${lng}`,
          radius: radius,
          type: type,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });
      
      res.json({
        success: true,
        places: response.data.results.map(place => ({
          id: place.place_id,
          name: place.name,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          rating: place.rating,
          vicinity: place.vicinity,
          types: place.types
        }))
      });
    } catch (error) {
      console.error('Nearby places error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Initialize test data for the map
  async initTestData() {
    const count = await dbPromise.get('SELECT COUNT(*) as count FROM map_points');
    
    if (count.count === 0) {
      const testPoints = [
        { 
          id: 'tower_north', 
          title: 'North Tower', 
          lat: 48.8567, 
          lng: 2.3523, 
          type: 'tower', 
          description: 'Built in the 12th century for defense. Offers panoramic views of the valley.',
          google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
        },
        { 
          id: 'tower_south', 
          title: 'South Tower', 
          lat: 48.8563, 
          lng: 2.3521, 
          type: 'tower', 
          description: 'Observation deck with city views. Contains medieval exhibition.',
          google_place_id: null
        },
        { 
          id: 'gate_main', 
          title: 'Main Gate', 
          lat: 48.8565, 
          lng: 2.3522, 
          type: 'entrance', 
          description: 'Historic entrance with drawbridge. Preserved since the 13th century.',
          google_place_id: null
        },
        { 
          id: 'parking', 
          title: 'Parking Lot', 
          lat: 48.8555, 
          lng: 2.3510, 
          type: 'service', 
          description: 'Free parking for 200 cars. Accessible for disabled.',
          google_place_id: null
        },
        { 
          id: 'wc', 
          title: 'Restrooms', 
          lat: 48.8560, 
          lng: 2.3525, 
          type: 'service', 
          description: 'Clean facilities with disabled access. Baby changing available.',
          google_place_id: null
        },
        { 
          id: 'elevator', 
          title: 'Elevator', 
          lat: 48.8564, 
          lng: 2.3524, 
          type: 'service', 
          description: 'Elevator for strollers and mobility-impaired visitors.',
          google_place_id: null
        },
        { 
          id: 'restaurant', 
          title: 'Castle Restaurant', 
          lat: 48.8566, 
          lng: 2.3520, 
          type: 'service', 
          description: 'Traditional cuisine. Open 10:00-18:00.',
          google_place_id: null
        }
      ];
      
      for (const point of testPoints) {
        await dbPromise.run(
          `INSERT INTO map_points (id, title, lat, lng, type, description, google_place_id, active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [point.id, point.title, point.lat, point.lng, point.type, point.description, point.google_place_id]
        );
      }
      
      // Add some fun facts for towers
      await dbPromise.run(
        `INSERT INTO point_facts (point_id, fact) VALUES 
         ('tower_north', 'The tower was used as a prison during the 15th century'),
         ('tower_north', 'Secret tunnel connects to the main castle'),
         ('tower_south', 'The clock mechanism is original from 1420'),
         ('tower_south', 'Ghost sightings reported on full moons')`
      );
      
      console.log('✅ Test map points added with Google Maps integration');
    }
  }
}

module.exports = new MapController();