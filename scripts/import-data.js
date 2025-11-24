#!/usr/bin/env node

/**
 * Automatically imports CSV data on database initialization
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const AGENCIES_CSV = path.join(__dirname, '../public/agencies_agency_rows.csv');
const CONTACTS_CSV = path.join(__dirname, '../public/contacts_contact_rows.csv');

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

async function importData() {
  console.log('🚀 Importing CSV data...\n');

  try {
    // Check if data already exists
    const agencyCount = await prisma.agency.count();
    if (agencyCount > 0) {
      console.log('✅ Data already imported. Skipping...');
      return;
    }

    // Import agencies
    console.log('📊 Importing agencies...');
    const agencyRows = await parseCSV(AGENCIES_CSV);
    const agencies = agencyRows.map(row => ({
      id: row.id,
      name: row.name || '',
      state: row.state || null,
      state_code: row.state_code || null,
      type: row.type || null,
      population: row.population || null,
      website: row.website || null,
      total_schools: row.total_schools || null,
      total_students: row.total_students || null,
      mailing_address: row.mailing_address || null,
      grade_span: row.grade_span || null,
      locale: row.locale || null,
      csa_cbsa: row.csa_cbsa || null,
      domain_name: row.domain_name || null,
      physical_address: row.physical_address || null,
      phone: row.phone || null,
      status: row.status || null,
      student_teacher_ratio: row.student_teacher_ratio || null,
      supervisory_union: row.supervisory_union || null,
      county: row.county || null,
    }));

    await prisma.agency.createMany({
      data: agencies,
    });
    console.log(`✅ Imported ${agencies.length} agencies\n`);

    // Import contacts
    console.log('👥 Importing contacts...');
    const contactRows = await parseCSV(CONTACTS_CSV);
    
    // Get all valid agency IDs
    const validAgencyIds = new Set(agencies.map(a => a.id));
    
    // Filter contacts to only include those with valid agency_id
    const contacts = contactRows
      .filter(row => row.agency_id && validAgencyIds.has(row.agency_id))
      .map(row => ({
        id: row.id,
        first_name: row.first_name || '',
        last_name: row.last_name || '',
        email: row.email || '',
        phone: row.phone || null,
        title: row.title || null,
        email_type: row.email_type || null,
        contact_form_url: row.contact_form_url || null,
        department: row.department || null,
        firm_id: row.firm_id || null,
        agency_id: row.agency_id,
      }));

    await prisma.contact.createMany({
      data: contacts,
    });
    console.log(`✅ Imported ${contacts.length} contacts\n`);

    console.log('🎉 Data import completed successfully!');
  } catch (error) {
    console.error('❌ Error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

await importData();

