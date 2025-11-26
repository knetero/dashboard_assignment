import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 })
    }

    // Parse CSV - headers: name,state,state_code,type,population,website,total_schools,total_students,mailing_address,grade_span,locale,csa_cbsa,domain_name,physical_address,phone,status,student_teacher_ratio,supervisory_union,county,created_at,updated_at,id
    const headers = lines[0].split(',').map(h => h.trim())
    const agencies = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const agency: Record<string, string> = {}

      for (let index = 0; index < headers.length; index++) {
        agency[headers[index]] = values[index] || ''
      }

      agencies.push({
        id: agency.id,
        name: agency.name || `Agency ${i}`,
        state: agency.state || null,
        state_code: agency.state_code || null,
        type: agency.type || null,
        population: agency.population || null,
        website: agency.website || null,
        total_schools: agency.total_schools || null,
        total_students: agency.total_students || null,
        mailing_address: agency.mailing_address || null,
        grade_span: agency.grade_span || null,
        locale: agency.locale || null,
        csa_cbsa: agency.csa_cbsa || null,
        domain_name: agency.domain_name || null,
        physical_address: agency.physical_address || null,
        phone: agency.phone || null,
        status: agency.status || null,
        student_teacher_ratio: agency.student_teacher_ratio || null,
        supervisory_union: agency.supervisory_union || null,
        county: agency.county || null,
      })
    }

    // Bulk insert agencies
    const result = await prisma.agency.createMany({
      data: agencies,
    })

    return NextResponse.json({
      message: 'Agencies imported successfully',
      count: result.count,
    })
  } catch (error) {
    console.error('Error importing agencies:', error)
    return NextResponse.json(
      { error: 'Failed to import agencies' },
      { status: 500 }
    )
  }
}
