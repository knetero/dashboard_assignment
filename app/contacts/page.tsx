'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Contact = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  title: string | null
  email_type: string | null
  contact_form_url: string | null
  created_at: Date
  updated_at: Date
  department: string | null
  firm_id: string | null
  agency_id: string
  agency: {
    name: string
  }
}

type ContactsData = {
  contacts: Contact[]
  viewCount: number
  remaining: number
  limit: number
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [totalContacts, setTotalContacts] = useState(0)
  const [viewCount, setViewCount] = useState(0)
  const [remaining, setRemaining] = useState(50)
  const [limit, setLimit] = useState(50)
  const [loading, setLoading] = useState(true)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [pageLoading, setPageLoading] = useState(false)
  const [previousContacts, setPreviousContacts] = useState<Contact[]>([])

  // Pagination calculations
  const totalPages = Math.ceil(totalContacts / itemsPerPage)
  
  // Use previous contacts while loading to prevent flash
  const displayContacts = pageLoading && previousContacts.length > 0 ? previousContacts : contacts

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

  // Load limit info on mount
  useEffect(() => {
    async function loadLimitInfo() {
      try {
        const response = await fetch('/api/contacts/view-limit')
        const data = await response.json()
        setViewCount(data.viewCount || 0)
        setRemaining(data.remaining || 50)
        setLimit(data.limit || 50)
        
        if (data.remaining === 0) {
          setShowUpgradePrompt(true)
        }
      } catch (error) {
        console.error('Error loading limit info:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLimitInfo()
  }, [])

  // Load contacts for current page
  useEffect(() => {
    async function loadPageContacts() {
      if (showUpgradePrompt || loading) return
      
      setPageLoading(true)
      try {
        const response = await fetch(
          `/api/contacts?page=${currentPage}&limit=${itemsPerPage}`
        )
        
        if (response.status === 403) {
          const errorData = await response.json()
          setViewCount(errorData.viewCount || 50)
          setRemaining(0)
          setShowUpgradePrompt(true)
          setPageLoading(false)
          return
        }

        const data = await response.json()
        setPreviousContacts(contacts) // Store previous contacts
        setContacts(data.contacts || [])
        setTotalContacts(data.total || 0)
        setViewCount(data.viewCount || 0)
        setRemaining(data.remaining || 0)
        setLimit(data.limit || 50)
      } catch (error) {
        console.error('Error loading page contacts:', error)
      } finally {
        // Delay to ensure smooth transition
        setTimeout(() => setPageLoading(false), 150)
      }
    }

    loadPageContacts()
  }, [currentPage, itemsPerPage, showUpgradePrompt, loading])

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
        <p className="text-muted-foreground mt-4">Loading contacts...</p>
      </div>
    )
  }

  if (showUpgradePrompt) {
    return (
      <div className="flex items-center justify-center p-6">
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-4">
                <svg
                  className="h-12 w-12 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl">Daily View Limit Reached</CardTitle>
            <CardDescription className="text-base mt-2">
              You&apos;ve reached your daily limit of {limit} contact views
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Upgrade to premium to get unlimited access to all contacts and enjoy additional features.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => alert('Payment integration not implemented')}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Upgrade to Premium
              </Button>
              <Button variant="outline" className="w-full" onClick={() => globalThis.history.back()}>
                Back
              </Button>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Your limit will reset tomorrow at midnight UTC
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            View and manage contacts with daily view limit tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-primary">{totalContacts}</span>
              <span className="text-xs text-muted-foreground font-medium">Total</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <span className="text-xs text-muted-foreground">{viewCount} / {limit} viewed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${remaining > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium">{remaining} remaining</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <CardTitle className="text-xl font-bold">All Contacts</CardTitle>
              <CardDescription className="text-sm mt-0.5">
                {totalContacts === 0 ? 'No contacts available' : `Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, totalContacts)} of ${totalContacts} contacts`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto relative">
          <div className="overflow-y-auto" style={{ maxHeight: '500px', minHeight: '400px' }}>
            <table className="w-full table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/50 border-b-2">
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-[200px] whitespace-nowrap">Contact ID</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-[140px] whitespace-nowrap">First Name</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-[140px] whitespace-nowrap">Last Name</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-60 whitespace-nowrap">Email</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-[150px] whitespace-nowrap">Phone</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-[180px] whitespace-nowrap">Title</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-[140px] whitespace-nowrap">Email Type</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-[200px] whitespace-nowrap">Contact Form URL</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-[140px] whitespace-nowrap">Department</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-[140px] whitespace-nowrap">Firm ID</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-[180px] whitespace-nowrap">Agency</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-[200px] whitespace-nowrap">Agency ID</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-40 whitespace-nowrap">Created At</th>
                  <th className="font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left w-40 whitespace-nowrap">Updated At</th>
                </tr>
              </thead>
            <tbody>
              {pageLoading ? (
                <tr className="animate-pulse">
                  <td colSpan={14} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 opacity-60">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground">Loading contacts...</p>
                    </div>
                  </td>
                </tr>
              ) : displayContacts.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="font-medium">No contacts available</p>
                      <p className="text-sm">You&apos;ve reached your daily viewing limit</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayContacts.map((contact: Contact, idx: number) => (
                  <tr 
                    key={contact.id} 
                    className={`hover:bg-muted/50 transition-all duration-200 border-b ${pageLoading ? 'opacity-50' : 'animate-in fade-in'}`}
                    style={{ 
                      height: '60px',
                      animationDelay: pageLoading ? '0ms' : `${idx * 30}ms`,
                      animationDuration: '300ms',
                      animationFillMode: 'backwards'
                    }}
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="truncate whitespace-nowrap overflow-hidden text-xs font-mono" title={contact.id}>{contact.id}</div>
                    </td>
                    <td className="font-medium px-4 py-3 align-middle">
                      <div className="truncate whitespace-nowrap overflow-hidden" title={contact.first_name}>{contact.first_name}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="truncate whitespace-nowrap overflow-hidden" title={contact.last_name}>{contact.last_name}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="truncate whitespace-nowrap overflow-hidden text-sm" title={contact.email}>{contact.email}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="truncate whitespace-nowrap overflow-hidden" title={contact.phone || '—'}>{contact.phone || <span className="text-muted-foreground">—</span>}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {contact.title ? (
                        <Badge variant="outline" className="font-normal text-xs inline-block max-w-full">
                          <div className="truncate whitespace-nowrap overflow-hidden" title={contact.title}>{contact.title}</div>
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="truncate whitespace-nowrap overflow-hidden" title={contact.email_type || '—'}>{contact.email_type || <span className="text-muted-foreground">—</span>}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {contact.contact_form_url ? (
                        <a
                          href={contact.contact_form_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
                        >
                          <div className="truncate whitespace-nowrap overflow-hidden max-w-[180px]" title={contact.contact_form_url}>Form</div>
                          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="truncate whitespace-nowrap overflow-hidden" title={contact.department || '—'}>{contact.department || <span className="text-muted-foreground">—</span>}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="truncate whitespace-nowrap overflow-hidden" title={contact.firm_id || '—'}>{contact.firm_id || <span className="text-muted-foreground">—</span>}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="truncate whitespace-nowrap overflow-hidden" title={contact.agency.name}>{contact.agency.name}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="truncate whitespace-nowrap overflow-hidden text-xs font-mono" title={contact.agency_id}>{contact.agency_id}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="truncate whitespace-nowrap overflow-hidden text-xs" title={new Date(contact.created_at).toLocaleString()}>{new Date(contact.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="truncate whitespace-nowrap overflow-hidden text-xs" title={new Date(contact.updated_at).toLocaleString()}>{new Date(contact.updated_at).toLocaleDateString()}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

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
