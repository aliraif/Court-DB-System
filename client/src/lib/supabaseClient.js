import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sdneoqvbiafjzmdilkvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbmVvcXZiaWFmanptZGlsa3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NjQ1NjEsImV4cCI6MjEwMDA0MDU2MX0.Y7wQn8DTnU8OIXz7b7uIFvhEZjePRnwD7BB_kGFLLZk';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not set.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
