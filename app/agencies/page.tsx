'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type Agency = {
  id: string
  name: string
  state: string | null
  state_code: string | null
  type: string | null
  population: number | null
  website: string | null
  total_schools: number | null
  total_students: number | null
  mailing_address: string | null
  grade_span: string | null
  locale: string | null
  csa_cbsa: string | null
  domain_name: string | null
  physical_address: string | null
  phone: string | null
  status: string | null
  student_teacher_ratio: number | null
  supervisory_union: string | null
  county: string | null
  created_at: Date
  updated_at: Date
  _count: {
    contacts: number
  }
}

const tableColumns = [
  { label: 'Agency ID', align: 'left' },
  { label: 'Name', align: 'left' },
  { label: 'Type', align: 'left' },
  { label: 'State', align: 'left' },
  { label: 'State Code', align: 'left' },
  { label: 'County', align: 'left' },
  { label: 'Population', align: 'right' },
  { label: 'Website', align: 'left' },
  { label: 'Phone', align: 'left' },
  { label: 'Total Schools', align: 'right' },
  { label: 'Total Students', align: 'right' },
  { label: 'Mailing Address', align: 'left' },
  { label: 'Physical Address', align: 'left' },
  { label: 'Grade Span', align: 'left' },
  { label: 'Locale', align: 'left' },
  { label: 'CSA CBSA', align: 'left' },
  { label: 'Domain Name', align: 'left' },
  { label: 'Status', align: 'left' },
  { label: 'Student Teacher Ratio', align: 'right' },
  { label: 'Supervisory Union', align: 'left' },
  { label: 'Created At', align: 'left' },
  { label: 'Updated At', align: 'left' },
  { label: 'Contacts', align: 'right' },
]

const AgencyRowSkeleton = () => (
  <TableRow>
    {tableColumns.map((_, idx) => (
      <TableCell key={idx} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </TableCell>
    ))}
  </TableRow>
)

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [totalAgencies, setTotalAgencies] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [pageCache, setPageCache] = useState<Map<number, Agency[]>>(new Map())

  // Pagination calculations
  const totalPages = Math.ceil(totalAgencies / itemsPerPage)
  const currentAgencies = agencies

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  useEffect(() => {
    async function loadAgencies() {
      if (loading) return
      
      // Check if page is already cached
      if (pageCache.has(currentPage)) {
        setAgencies(pageCache.get(currentPage)!)
        return
      }
      
      setPageLoading(true)
      try {
        const response = await fetch(
          `/api/agencies?page=${currentPage}&limit=${itemsPerPage}`,
          { headers: { 'Cache-Control': 'no-cache' } }
        )
        const data = await response.json()
        const fetchedAgencies = data.agencies || []
        
        setAgencies(fetchedAgencies)
        setTotalAgencies(data.total || 0)
        
        // Cache this page's data
        setPageCache(prev => new Map(prev).set(currentPage, fetchedAgencies))
      } catch (error) {
        console.error('Error loading agencies:', error)
        setAgencies([])
      } finally {
        setPageLoading(false)
      }
    }

    loadAgencies()
  }, [currentPage, itemsPerPage, loading, pageCache])

  // Initial load
  useEffect(() => {
    setLoading(false)
  }, [])

  // Reset page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground mt-4">Loading agencies...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Agencies</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all agencies in your database
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-primary">{totalAgencies}</span>
            <span className="text-xs text-muted-foreground font-medium">Total</span>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">All Agencies</CardTitle>
                <CardDescription className="text-sm">
                  {totalAgencies === 0 ? 'No agencies available' : `Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, totalAgencies)} of ${totalAgencies} agencies`}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <div className="px-4 pb-2 md:hidden">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 px-3 py-2 rounded-md">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Scroll horizontally to view all columns</span>
          </div>
        </div>
        <CardContent className="p-0 overflow-x-auto relative">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-muted/50 border-b-2">
                {tableColumns.map((column) => (
                  <TableHead 
                    key={column.label}
                    className={`font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground ${column.align === 'right' ? 'text-right' : ''}`}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageLoading ? (
                Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <AgencyRowSkeleton key={`skeleton-${idx}`} />
                ))
              ) : agencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={23} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="font-medium">No agencies found</p>
                      <p className="text-sm">Import CSV data to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentAgencies.map((agency: Agency) => (
                  <TableRow key={agency.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="px-4 py-3">
                      <div className="text-xs font-mono max-w-[200px] truncate" title={agency.id}>{agency.id}</div>
                    </TableCell>
                    <TableCell className="font-medium px-4 py-3 max-w-[200px] truncate">{agency.name}</TableCell>
                    <TableCell className="px-4 py-3">
                      {agency.type ? (
                        <Badge variant="outline" className="font-normal text-xs px-1.5 py-0">
                          {agency.type}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">{agency.state || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3">{agency.state_code || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3 max-w-[150px] truncate">{agency.county || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3 text-right">{agency.population?.toLocaleString() || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3">
                      {agency.website ? (
                        <a
                          href={agency.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
                        >
                          Visit
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">{agency.phone || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3 text-right">{agency.total_schools || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3 text-right">{agency.total_students?.toLocaleString() || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3 max-w-[200px] truncate">{agency.mailing_address || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3 max-w-[200px] truncate">{agency.physical_address || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3">{agency.grade_span || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3">{agency.locale || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3">{agency.csa_cbsa || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3">{agency.domain_name || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3">{agency.status || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3 text-right">{agency.student_teacher_ratio || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3">{agency.supervisory_union || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="text-xs" title={new Date(agency.created_at).toLocaleString()}>{new Date(agency.created_at).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="text-xs" title={new Date(agency.updated_at).toLocaleString()}>{new Date(agency.updated_at).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="text-right px-4 py-3">
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {agency._count.contacts}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-4 py-4 border-t">
            <div className="flex items-center justify-center gap-2">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2 text-xs md:h-9 md:px-3 md:text-sm"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4 md:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden md:inline">Previous</span>
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page as number)}
                      className="h-8 w-8 p-0 text-xs md:h-9 md:w-9 md:text-sm"
                    >
                      {page}
                    </Button>
                  )
                ))}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2 text-xs md:h-9 md:px-3 md:text-sm"
              >
                <span className="hidden md:inline">Next</span>
                <svg className="w-3 h-3 md:w-4 md:h-4 md:ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
