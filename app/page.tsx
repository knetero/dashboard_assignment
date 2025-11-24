import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome to your Agency & Contact Management Hub
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Agencies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold tracking-tight">922</div>
            <p className="text-xs text-muted-foreground mt-1">
              All agencies in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold tracking-tight">68</div>
            <p className="text-xs text-muted-foreground mt-1">
              Contacts available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Limit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold tracking-tight">50</div>
            <p className="text-xs text-muted-foreground mt-1">
              Contacts per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold tracking-tight text-green-600">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/agencies" className="group">
          <Card className="transition-all hover:shadow-lg hover:border-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg">
                  <svg className="h-6 w-6 text-foreground" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M1.75 2a.75.75 0 0 0 0 1.5H2v9h-.25a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h.5a.75.75 0 0 0 .75-.75V3.5h.25a.75.75 0 0 0 0-1.5zM3.5 5.5A.5.5 0 0 1 4 5h.5a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5zm.5 2a.5.5 0 0 0-.5.5v.5A.5.5 0 0 0 4 9h.5a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5zm2-2a.5.5 0 0 1 .5-.5H7a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-.5.5h-.5A.5.5 0 0 1 6 6zm.5 2A.5.5 0 0 0 6 8v.5a.5.5 0 0 0 .5.5H7a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5zm5-1.5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.75a.75.75 0 0 0 0-1.5H14v-5h.25a.75.75 0 0 0 0-1.5zm.5 1.5h.5a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5H12a.5.5 0 0 1-.5-.5V8a.5.5 0 0 1 .5-.5m0 2.5a.5.5 0 0 0-.5.5v.5a.5.5 0 0 0 .5.5h.5a.5.5 0 0 0 .5-.5v-.5a.5.5 0 0 0-.5-.5z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center justify-between">
                    Agencies
                    <Badge variant="secondary">Unlimited</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Browse and manage all agency records
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-12">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  Complete agency database access
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  View contact counts per agency
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  No viewing restrictions
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link href="/contacts" className="group">
          <Card className="transition-all hover:shadow-lg hover:border-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg">
                  <svg className="h-6 w-6 text-foreground" viewBox="0 0 1024 1024" fill="currentColor">
                    <path d="M928 224H768v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56H548v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56H328v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56H96c-17.7 0-32 14.3-32 32v576c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V256c0-17.7-14.3-32-32-32M661 736h-43.9c-4.2 0-7.6-3.3-7.9-7.5c-3.8-50.6-46-90.5-97.2-90.5s-93.4 40-97.2 90.5c-.3 4.2-3.7 7.5-7.9 7.5H363a8 8 0 0 1-8-8.4c2.8-53.3 32-99.7 74.6-126.1a111.8 111.8 0 0 1-29.1-75.5c0-61.9 49.9-112 111.4-112s111.4 50.1 111.4 112c0 29.1-11 55.5-29.1 75.5c42.7 26.5 71.8 72.8 74.6 126.1c.4 4.6-3.2 8.4-7.8 8.4M512 474c-28.5 0-51.7 23.3-51.7 52s23.2 52 51.7 52s51.7-23.3 51.7-52s-23.2-52-51.7-52"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center justify-between">
                    Contacts
                    <Badge>50/day</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    View and manage contact information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-12">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  Daily view limit tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  Resets at midnight UTC
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  Upgrade for unlimited access
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Getting Started</CardTitle>
          <CardDescription>
            Quick guide to navigating your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background">
                <span className="text-sm font-bold">1</span>
              </div>
              <div className="space-y-1 flex-1">
                <p className="font-semibold">Data Ready</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your agency and contact data has been automatically imported from CSV files and is ready to explore.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background">
                <span className="text-sm font-bold">2</span>
              </div>
              <div className="space-y-1 flex-1">
                <p className="font-semibold">Browse Agencies</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Access unlimited agency records. View details, filter by type, and explore contact counts for each organization.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background">
                <span className="text-sm font-bold">3</span>
              </div>
              <div className="space-y-1 flex-1">
                <p className="font-semibold">View Contacts</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Access up to 50 contacts per day. Your daily limit resets at midnight UTC. Track usage in real-time.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

