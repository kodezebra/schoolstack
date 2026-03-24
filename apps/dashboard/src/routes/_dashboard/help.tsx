import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Moon, Sun, Search, BookOpen, Bell, Users, CheckSquare } from "lucide-react"
import { GuidesSection, WhatsNewSection, PersonasSection } from './sections'
import { whatsNew, type HelpArticle, type UserRole } from "@/components/help"

export const Route = createFileRoute('/_dashboard/help')({
  component: HelpPage,
})

function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setSelectedArticle(null)} className="mb-4">
            Back to Help Center
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{selectedArticle.title}</h1>
              <p className="text-muted-foreground mt-2">
                {selectedArticle.category} • 
                <Badge variant="secondary" className="ml-2">
                  {selectedArticle.role === "all" ? "All users" : selectedArticle.role}
                </Badge>
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div 
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: simpleMarkdown(selectedArticle.content) }}
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Was this article helpful?
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CheckSquare className="h-4 w-4 mr-2" />
              Yes
            </Button>
            <Button variant="outline" size="sm">
              Not quite
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Learn how to get the most out of SchoolStack
        </p>
      </div>

      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-lg"
        />
      </div>

      <Tabs defaultValue="guides" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="guides">
            <BookOpen className="h-4 w-4 mr-2" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="whatsnew">
            <Bell className="h-4 w-4 mr-2" />
            What's New
            {whatsNew.length > 0 && (
              <Badge variant="secondary" className="ml-2">{whatsNew.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="personas">
            <Users className="h-4 w-4 mr-2" />
            By Role
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="mt-0">
          <GuidesSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedRole={selectedRole}
            onArticleSelect={setSelectedArticle}
          />
        </TabsContent>

        <TabsContent value="whatsnew" className="mt-0">
          <WhatsNewSection />
        </TabsContent>

        <TabsContent value="personas" className="mt-0">
          <PersonasSection
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            onArticleSelect={setSelectedArticle}
          />
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/50">
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <h3 className="font-semibold">Need more help?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Contact our support team for personalized assistance
            </p>
          </div>
          <Button>
            <ExternalLink className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function simpleMarkdown(text: string): string {
  return text
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-5 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim())
      return '<tr>' + cells.map(c => `<td class="border px-3 py-2">${c.trim()}</td>`).join('') + '</tr>'
    })
    .replace(/(<tr>.*<\/tr>)/gs, '<table class="w-full border-collapse my-4">$1</table>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/\n\n/g, '</p><p class="my-3">')
}
