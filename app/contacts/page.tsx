'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

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

const tableColumns = [
  { label: 'Contact ID', width: 'w-[200px]' },
  { label: 'First Name', width: 'w-[140px]' },
  { label: 'Last Name', width: 'w-[140px]' },
  { label: 'Email', width: 'w-60' },
  { label: 'Phone', width: 'w-[150px]' },
  { label: 'Title', width: 'w-[180px]' },
  { label: 'Email Type', width: 'w-[140px]' },
  { label: 'Contact Form URL', width: 'w-[200px]' },
  { label: 'Department', width: 'w-[140px]' },
  { label: 'Firm ID', width: 'w-[140px]' },
  { label: 'Agency', width: 'w-[180px]' },
  { label: 'Agency ID', width: 'w-[200px]' },
  { label: 'Created At', width: 'w-40' },
  { label: 'Updated At', width: 'w-40' },
]

const ContactRowSkeleton = () => (
  <tr className="border-b">
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-full" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-20" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-24" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-40" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-28" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-32" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-20" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-16" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-24" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-32" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-28" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-full" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-24" /></td>
    <td className="px-4 py-3 align-middle"><Skeleton className="h-4 w-24" /></td>
  </tr>
)



export default function ContactsPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [resetting, setResetting] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [totalContacts, setTotalContacts] = useState(0)
  const [limit, setLimit] = useState(50)
  const [viewCount, setViewCount] = useState(0)
  const [remaining, setRemaining] = useState(50)
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [limitBlocked, setLimitBlocked] = useState(false) // Track if access is blocked by limit
  const itemsPerPage = 5

  // Cache for storing previously loaded pages
  // Key: page number, Value: contacts data for that page
  const [contactsCache, setContactsCache] = useState<Record<number, Contact[]>>({})

  // Pagination calculations
  const totalPages = Math.ceil(totalContacts / itemsPerPage)

  // Calculate the maximum page number user can access based on view limit
  // This should be based on how many contacts they can access in total:
  // contacts already viewed + contacts remaining = total accessible contacts
  const totalAccessibleContacts = viewCount + remaining
  const maxAccessiblePage = Math.ceil(totalAccessibleContacts / itemsPerPage)

  // Helper function to check if a page is accessible
  const isPageAccessible = (pageNum: number) => {
    return pageNum <= maxAccessiblePage
  }

  // Load page data when page changes
  useEffect(() => {
    const loadPage = async () => {
      // Check cache FIRST for instant rendering when going backwards
      if (contactsCache[currentPage]) {
        console.log(`Loading page ${currentPage} from cache`)
        setContacts(contactsCache[currentPage])
        setPageLoading(false)
        setLoading(false)

        // Fetch view limit status in background to keep badge updated
        // Don't await this - let it update asynchronously
        fetch('/api/contacts/view-limit', {
          headers: { 'Cache-Control': 'no-cache' }
        })
          .then(response => response.ok ? response.json() : null)
          .then(limitData => {
            if (limitData) {
              setViewCount(limitData.viewCount || 0)
              setRemaining(limitData.remaining ?? 0)
              setLimit(limitData.limit || 50)
              setTotalContacts(limitData.total || 0)
            }
          })
          .catch(error => console.error('Error fetching view limit:', error))

        return
      }

      // Not in cache, fetch from server
      setPageLoading(true)
      try {
        const response = await fetch(
          `/api/contacts?page=${currentPage}&limit=${itemsPerPage}`,
          { headers: { 'Cache-Control': 'no-cache' } }
        )

        if (response.status === 403) {
          const errorData = await response.json()
          setLimit(errorData.limit || 50)
          setViewCount(errorData.viewCount || 0)
          setRemaining(0)
          setContacts([])
          setLimitBlocked(true) // Mark that we're actually blocked
          setPageLoading(false)
          setLoading(false)
          return
        }

        // If we successfully fetched contacts, we're not blocked
        setLimitBlocked(false)

        const data = await response.json()
        const fetchedContacts = data.contacts || []

        // Update cache with newly fetched contacts
        setContactsCache(prev => ({
          ...prev,
          [currentPage]: fetchedContacts
        }))

        setContacts(fetchedContacts)
        setTotalContacts(data.total || 0)
        setViewCount(data.viewCount || 0)
        setRemaining(data.remaining ?? 0)
        setLimit(data.limit || 50)
      } catch (error) {
        console.error('Error loading contacts:', error)
      } finally {
        setPageLoading(false)
        setLoading(false)
      }
    }

    loadPage()
  }, [currentPage, itemsPerPage])



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

  const handleResetLimits = async () => {
    setResetting(true)
    try {
      const response = await fetch('/api/contacts/reset-limits', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (response.ok) {
        // Clear the cache before reloading
        setContactsCache({})
        setLimitBlocked(false) // Reset the blocked state
        // Simply reload the page to start fresh from page 1
        window.location.href = window.location.href
      } else {
        const error = await response.json()
        console.error('Reset failed:', error)
        alert('Failed to reset limits: ' + (error.error || 'Unknown error'))
        setResetting(false)
      }
    } catch (error) {
      console.error('Error resetting limits:', error)
      alert('Failed to reset limits: ' + error)
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground mt-4">Loading contacts...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Limit Reached Dialog */}
      {/* Limit Reached Dialog */}
      <Dialog open={limitBlocked} onOpenChange={() => router.push('/')}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-6 w-6 text-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <DialogTitle className="text-xl text-center">Limit Reached</DialogTitle>
            <DialogDescription className="text-center pt-1">
              You&apos;ve reached your daily limit of {limit} contacts. Upgrade to continue viewing more contacts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2 mt-2">
            <Button
              className="w-full"
              onClick={() => alert('Payment integration not implemented')}
            >
              Upgrade to Premium
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Back to Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetLimits}
              disabled={resetting}
              className="w-full text-xs text-muted-foreground"
            >
              {resetting ? 'Resetting...' : 'Reset Limits (Dev)'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content - Hidden when limit reached */}
      {!limitBlocked && (
        <>

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Contacts</h1>
              <p className="text-muted-foreground mt-1">
                View and manage contacts with daily view limit tracking
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetLimits}
                disabled={resetting}
                className="text-xs shrink-0"
              >
                {resetting ? 'Resetting...' : '🔄 Reset Limits (Dev)'}
              </Button>
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-primary/10 border border-primary/20">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-2xl font-bold text-primary">{totalContacts}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium whitespace-nowrap">Total</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-muted/50 border">
                <div className="flex flex-col gap-0.5 sm:gap-1">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-blue-500 shrink-0"></div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{viewCount} / {limit} viewed</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <div className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full shrink-0 ${remaining > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">{remaining} remaining</span>
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

            <div className="px-4 pb-2 md:hidden">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 px-3 py-2 rounded-md">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Scroll horizontally to view all columns</span>
              </div>
            </div>

            <CardContent className="p-0 overflow-x-auto relative">
              {contacts.length === 0 && !pageLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-24">
                  <svg className="w-16 h-16 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="text-center">
                    <p className="font-semibold text-lg text-foreground">No contacts available</p>
                    <p className="text-sm text-muted-foreground mt-1">There are no contacts to display at the moment</p>
                  </div>
                </div>
              ) : (
                <table className="w-full table-fixed">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-muted/50 border-b-2">
                      {tableColumns.map((column) => (
                        <th
                          key={column.label}
                          className={`font-semibold px-4 py-4 text-xs uppercase tracking-wider text-foreground text-left ${column.width} whitespace-nowrap`}
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageLoading ? (
                      // Skeleton loading state
                      Array.from({ length: itemsPerPage }).map((_, idx) => (
                        <ContactRowSkeleton key={`skeleton-${idx}`} />
                      ))
                    ) : (
                      contacts.map((contact: Contact) => (
                        <tr
                          key={contact.id}
                          className="hover:bg-muted/50 transition-all duration-200 border-b"
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
              )}
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
                    disabled={currentPage === 1 || pageLoading}
                    className="h-8 px-2 text-xs md:h-9 md:px-3 md:text-sm"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 md:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden md:inline">Previous</span>
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                      const isAccessible = typeof page === 'number' && page <= maxAccessiblePage
                      const isOneBeyond = typeof page === 'number' && page === maxAccessiblePage + 1
                      const shouldDisable = !isAccessible && !isOneBeyond

                      return page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                          …
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page as number)}
                          disabled={shouldDisable || limitBlocked || pageLoading}
                          className={`h-8 w-8 p-0 text-xs md:h-9 md:w-9 md:text-sm ${shouldDisable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title={shouldDisable ? 'Upgrade to view more contacts' : isOneBeyond ? 'Click to see upgrade options' : ''}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages || limitBlocked || pageLoading}
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
        </>
      )}
    </div>
  )
}
