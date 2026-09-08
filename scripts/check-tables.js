import fs from 'fs';

async function fetchSchema() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  
  try {
    const response = await fetch(`${url}/rest/v1/?apikey=${key}`);
    const data = await response.json();
    const schemas = data.definitions || data.components?.schemas || {};
    
    console.log("Tables available:", Object.keys(schemas));
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

fetchSchema();
