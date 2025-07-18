import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lnjswhylqqmjwpkddnup.supabase.co"; // 🔁 Replace this
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuanN3aHlscXFtandwa2RkbnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjEzMzcsImV4cCI6MjA2Nzk5NzMzN30.mggxuWqSepfHLfShQpLz8M7xj_1BQ4R7haPqQHZTyaM"; // 🔁 Replace this

export const supabase = createClient(supabaseUrl, supabaseKey);
