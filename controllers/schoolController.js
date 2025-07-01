import pool from '../models/db.js';
import haversine from 'haversine-distance';

export const addSchool = async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'Invalid input. Please provide name, address, latitude, and longitude.' });
  }

  try {
    await pool.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: 'School added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

export const listSchools = async (req, res) => {
  const { latitude, longitude } = req.query;

  try {
    const [rows] = await pool.query('SELECT * FROM schools');
 if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);

      const sorted = rows.map(school => {
        const distance = haversine(
          { lat: userLat, lon: userLng },
          { lat: school.latitude, lon: school.longitude }
        ) / 1000; 

        return { ...school, distance: distance.toFixed(2) };
      }).sort((a, b) => a.distance - b.distance);

      return res.json(sorted);
    }

    return res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching schools', error: err.message });
  }
};
