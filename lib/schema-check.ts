// Script to check current database schema
import { supabase } from './supabase'

export async function checkDatabaseSchema() {
  console.log('Checking current database schema...')
  
  try {
    // Check if tables exist and get their structure
    const tables = [
      'trees',
      'tree_logs', 
      'batch_logs',
      'tree_costs',
      'varieties',
      'fertilizers',
      'pesticides',
      'plant_diseases',
      'activities',
      'activities_cost'
    ]
    
    for (const table of tables) {
      console.log(`\nChecking table: ${table}`)
      
      // Try to get first few rows to understand structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
        
      if (error) {
        console.log(`  ❌ Table ${table} error:`, error.message)
      } else {
        console.log(`  ✅ Table ${table} exists`)
        if (data && data.length > 0) {
          console.log(`  📋 Columns:`, Object.keys(data[0]))
        }
      }
    }
    
    return true
  } catch (error) {
    console.error('Schema check failed:', error)
    return false
  }
}