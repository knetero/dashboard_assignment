'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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

// localStorage helper functions
const CACHE_KEY = 'contacts-page-cache'
const LIMIT_KEY = 'contacts-limit-info'

const saveToCache = (page: number, data: Contact[]) => {
  if (typeof window === 'undefined') return
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    cache[page] = data
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Error saving to cache:', error)
  }
}

const getFromCache = (page: number): Contact[] | null => {
  if (typeof window === 'undefined') return null
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    return cache[page] || null
  } catch (error) {
    console.error('Error reading from cache:', error)
    return null
  }
}

const saveLimitInfo = (info: { viewCount: number; remaining: number; limit: number; total: number }) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LIMIT_KEY, JSON.stringify(info))
  } catch (error) {
    console.error('Error saving limit info:', error)
  }
}

const getLimitInfo = () => {
  if (typeof window === 'undefined') return null
  try {
    const info = localStorage.getItem(LIMIT_KEY)
    return info ? JSON.parse(info) : null
  } catch (error) {
    console.error('Error reading limit info:', error)
    return null
  }
}

const getCachedPageCount = (): number => {
  if (typeof window === 'undefined') return 0
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    const pages = Object.keys(cache).map(Number).filter(p => cache[p] && cache[p].length > 0)
    return pages.length > 0 ? Math.max(...pages) : 0
  } catch {
    return 0
  }
}

export default function ContactsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [resetting, setResetting] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLimitLoading, setIsLimitLoading] = useState(true)
  
  // Initialize from localStorage immediately to avoid flash of incorrect data
  const [totalContacts, setTotalContacts] = useState(() => {
    if (typeof window === 'undefined') return 0
    const cached = getLimitInfo()
    return cached?.total || 0
  })
  const [limit, setLimit] = useState(() => {
    if (typeof window === 'undefined') return 50
    const cached = getLimitInfo()
    return cached?.limit || 50
  })
  
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const itemsPerPage = 5

  // Pagination calculations
  const totalPages = Math.ceil(totalContacts / itemsPerPage)
  const maxCachedPage = getCachedPageCount()
  const maxAccessiblePage = Math.max(maxCachedPage, 1) // User can only access up to the max cached page + 1
  
  // Use server's viewCount from localStorage (source of truth)
  const cachedLimitInfo = typeof window !== 'undefined' ? getLimitInfo() : null
  const actualViewedCount = Math.min(cachedLimitInfo?.viewCount ?? 0, limit)
  const actualRemaining = Math.max(0, limit - actualViewedCount)

  // Load cached data on mount and initial fetch
  useEffect(() => {
    const init = async () => {
      try {
        // First check localStorage for cached limit info
        const cachedLimitInfo = getLimitInfo()
        
        // Check current limit status from server
        const response = await fetch('/api/contacts/view-limit', {
          headers: { 'Cache-Control': 'no-cache' },
        })
        const data = await response.json()
        
        // Only update if server data is more restrictive than cache
        // This prevents API from resetting our limit state incorrectly
        if (cachedLimitInfo && cachedLimitInfo.remaining === 0) {
          // Trust the cached limit state - user was at limit
          setLimit(cachedLimitInfo.limit)
          setTotalContacts(data.total || cachedLimitInfo.total || 0)
        } else {
          // Use fresh server data
          setLimit(data.limit || 50)
          setTotalContacts(data.total || 0)
        }
        
        // If user is at limit but cache exists, verify cache is valid
        const serverRemaining = data.remaining ?? 50
        if (serverRemaining === 0 || (cachedLimitInfo && cachedLimitInfo.remaining === 0)) {
          const maxCached = getCachedPageCount()
          const expectedMaxPage = Math.ceil((data.limit || 50) / itemsPerPage)
          // If cache has more pages than possible, clear it
          if (maxCached > expectedMaxPage) {
            localStorage.removeItem(CACHE_KEY)
          }
        }
      } catch (error) {
        console.error('Error checking initial status:', error)
        // Fallback to cached data
        const cachedLimitInfo = getLimitInfo()
        if (cachedLimitInfo) {
          setLimit(cachedLimitInfo.limit)
          setTotalContacts(cachedLimitInfo.total)
        }
      } finally {
        setIsLimitLoading(false)
        setLoading(false)
      }
    }
    
    init()
  }, [])

  // Load page data (check cache first, then fetch)
  useEffect(() => {
    if (loading) return

    const loadPage = async () => {
      // Check cache first
      const cached = getFromCache(currentPage)
      if (cached) {
        setContacts(cached)
        return
      }

      // Fetch from API
      setPageLoading(true)
      try {
        const response = await fetch(
          `/api/contacts?page=${currentPage}&limit=${itemsPerPage}`,
          { headers: { 'Cache-Control': 'no-cache' } }
        )

        if (response.status === 403) {
          const errorData = await response.json()
          setLimit(errorData.limit || 50)
          saveLimitInfo({
            viewCount: errorData.viewCount || 50,
            remaining: 0,
            limit: errorData.limit || 50,
            total: totalContacts
          })
          setPageLoading(false)
          return
        }

        const data = await response.json()
        const fetchedContacts = data.contacts || []

        setContacts(fetchedContacts)
        setTotalContacts(data.total || 0)
        
        // Update limit info immediately
        const newLimitInfo = {
          viewCount: data.viewCount || 0,
          remaining: data.remaining ?? 0,
          limit: data.limit || 50,
          total: data.total || 0
        }
        
        setLimit(newLimitInfo.limit)

        // Save to cache and limit info
        saveToCache(currentPage, fetchedContacts)
        saveLimitInfo(newLimitInfo)
      } catch (error) {
        console.error('Error loading contacts:', error)
      } finally {
        setPageLoading(false)
      }
    }

    loadPage()
  }, [currentPage, itemsPerPage, loading, totalContacts])

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
        // Clear localStorage cache
        localStorage.removeItem(CACHE_KEY)
        localStorage.removeItem(LIMIT_KEY)
        // Hard reload to clear cache and fetch fresh data
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
      {/* Persistent Banner - Only show when limit reached and limit info is loaded */}
      {!isLimitLoading && actualRemaining === 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/30">
          <svg
            className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
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
          <AlertTitle className="text-yellow-900 dark:text-yellow-100 font-semibold">
            Daily View Limit Reached
          </AlertTitle>
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <p className="mb-3">
              You&apos;ve reached your daily limit of {limit} contacts. You can still view the contacts you&apos;ve already seen today, but need to upgrade to view new ones.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => alert('Payment integration not implemented')}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Upgrade to Premium
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetLimits}
                disabled={resetting}
                className="border-yellow-600 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900"
              >
                {resetting ? 'Resetting...' : '🔄 Reset Limits (Dev)'}
              </Button>
            </div>
            <p className="text-xs mt-2 text-yellow-700 dark:text-yellow-300">
              Your limit will reset tomorrow at midnight UTC
            </p>
          </AlertDescription>
        </Alert>
      )}

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
            {resetting ? 'Resetting...' : '🔄 Reset Limits'}
          </Button>
          {!isLimitLoading && (
            <>
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
                <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{actualViewedCount} / {limit} viewed</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full shrink-0 ${actualRemaining > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">{actualRemaining} remaining</span>
              </div>
            </div>
          </div>
            </>
          )}
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
                {getPageNumbers().map((page, index) => {
                  const isPageAccessible = typeof page === 'number' && page <= maxAccessiblePage + 1
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
                      disabled={!isPageAccessible}
                      className="h-8 w-8 p-0 text-xs md:h-9 md:w-9 md:text-sm"
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
                disabled={currentPage === totalPages || currentPage >= maxAccessiblePage + 1}
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
