#!/usr/bin/env node
import pg from 'pg';
import { readFileSync } from 'fs';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:0kNHk5kBmXyEKvCe@db.sruqarvhtmjcmqhjlhkj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function setupSchema() {
  try {
    await client.connect();
    console.log('✓ Connected to Supabase');

    const schema = readFileSync('./supabase-schema.sql', 'utf8');
    await client.query(schema);
    
    console.log('✓ Schema executed successfully');
    
    // Verify table exists
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'memories'
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ Table "memories" verified');
    }
    
    // Verify function exists
    const funcResult = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_name = 'search_memories'
    `);
    
    if (funcResult.rows.length > 0) {
      console.log('✓ Function "search_memories" verified');
    }

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

setupSchema();
