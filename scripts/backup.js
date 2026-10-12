const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = 'https://dgfdcglcqxawcnhnffcj.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmRjZ2xjcXhhd2NuaG5mZmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTE0MTcsImV4cCI6MjEwNjQyNzQxN30.vp9Ff8OEMt-D9n4nAMoCh48zrzFkOllDilUlPvH3goY';
const supabase = createClient(url, key);

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

function tableToSql(tableName, rows) {
  if (!rows || rows.length === 0) return `-- ${tableName}: 0 kayıt\n`;
  let sql = `-- ${tableName} (${rows.length} kayıt)\n`;
  for (const row of rows) {
    const cols = Object.keys(row);
    const colNames = cols.map(c => `"${c}"`).join(', ');
    const values = cols.map(c => escapeSql(row[c])).join(', ');
    sql += `INSERT INTO public.${tableName} (${colNames}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
  }
  return sql + '\n';
}

async function runBackup() {
  console.log('Supabase Cloud verileri çekiliyor...');
  
  const tables = ['site_settings', 'packages', 'applications', 'contact_messages', 'activity_logs', 'profiles'];
  const fullBackup = {
    backup_date: new Date().toISOString(),
    project_url: url,
    tables: {}
  };

  let sqlOutput = `-- ==========================================================\n`;
  sqlOutput += `-- SUPABASE CLOUD TAM VERİTABANI YEDEĞİ (DATA DUMP)\n`;
  sqlOutput += `-- Tarih: ${new Date().toLocaleString('tr-TR')}\n`;
  sqlOutput += `-- Proje: ${url}\n`;
  sqlOutput += `-- ==========================================================\n\n`;

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Tablo ${table} çekilirken hata:`, error.message);
      fullBackup.tables[table] = { error: error.message, data: [] };
    } else {
      console.log(`✓ ${table}: ${data.length} kayıt yedeklendi.`);
      fullBackup.tables[table] = data;
      sqlOutput += tableToSql(table, data);
    }
  }

  // 1. JSON formatında yedek
  const jsonPath = path.join(__dirname, '..', 'supabase_backup.json');
  fs.writeFileSync(jsonPath, JSON.stringify(fullBackup, null, 2), 'utf8');

  // 2. SQL formatında yedek
  const sqlPath = path.join(__dirname, '..', 'supabase_data_backup.sql');
  fs.writeFileSync(sqlPath, sqlOutput, 'utf8');

  console.log('\n=========================================');
  console.log('YEDEKLEME BAŞARIYLA TAMAMLANDI!');
  console.log('1. JSON Yedek Dosyası:', jsonPath);
  console.log('2. SQL Yedek Dosyası :', sqlPath);
  console.log('=========================================');
}

runBackup();
