import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from "react"
import { 
  Search, 
  Moon, 
  Sun, 
  ChevronRight,
  BookOpen,
  Bell,
  ExternalLink,
  Filter,
  FileText,
  Users,
  CheckSquare,
  Rocket,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  personas, 
  whatsNew, 
  helpArticles, 
  searchArticles,
  getFeaturedArticles,
  type UserRole,
  type HelpArticle
} from "@/components/help"

export const Route = createFileRoute('/_dashboard/help')({
  component: HelpPage,
})

function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)

  const filteredArticles = useMemo(() => {
    let articles = selectedRole === "all" 
      ? helpArticles 
      : helpArticles.filter(a => a.role === selectedRole || a.role === "all")
    
    if (searchQuery.trim()) {
      articles = searchArticles(searchQuery, selectedRole === "all" ? undefined : selectedRole)
    }
    
    return articles
  }, [searchQuery, selectedRole])

  const groupedArticles = useMemo(() => {
    const groups: Record<string, HelpArticle[]> = {}
    filteredArticles.forEach(article => {
      if (!groups[article.category]) {
        groups[article.category] = []
      }
      groups[article.category].push(article)
    })
    return groups
  }, [filteredArticles])

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setSelectedArticle(null)} className="mb-4">
            ← Back to Help Center
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
              <FileText className="h-4 w-4 mr-2" />
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

        <TabsContent value="guides" className="space-y-8">
          {searchQuery ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {filteredArticles.length} result{filteredArticles.length !== 1 ? "s" : ""} for "{searchQuery}"
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredArticles.map((article) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    onClick={() => setSelectedArticle(article)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Featured Articles */}
              {getFeaturedArticles(selectedRole === "all" ? undefined : selectedRole as UserRole).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Recommended for You</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {getFeaturedArticles(selectedRole === "all" ? undefined : selectedRole as UserRole).map((article) => (
                      <FeaturedArticleCard 
                        key={article.id} 
                        article={article} 
                        onClick={() => setSelectedArticle(article)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* All Articles by Category */}
              {Object.entries(groupedArticles).map(([category, articles]) => (
                <div key={category}>
                  <h2 className="text-xl font-semibold mb-4">{category}</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        onClick={() => setSelectedArticle(article)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="whatsnew" className="space-y-6">
          {whatsNew.map((item, index) => (
            <Card key={item.version} className={index === 0 ? "border-primary/50 bg-primary/5" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-primary border-primary">
                      v{item.version}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </div>
                  {index === 0 && (
                    <Badge variant="default">Latest</Badge>
                  )}
                </div>
                <CardTitle className="text-xl mt-2">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {item.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckSquare className="h-4 w-4 text-primary mt-1 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="personas" className="space-y-8">
          <div className="flex items-center gap-4 mb-6">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by your role:</span>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedRole === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRole("all")}
              >
                All
              </Button>
              {personas.map((persona) => {
                const Icon = persona.icon
                return (
                  <Button
                    key={persona.id}
                    variant={selectedRole === persona.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRole(persona.id)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {persona.name}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {personas
              .filter(p => selectedRole === "all" || p.id === selectedRole)
              .map((persona) => {
                const Icon = persona.icon
                const articles = helpArticles.filter(a => a.role === persona.id || a.role === "all")
                
                return (
                  <Card key={persona.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-primary/10`}>
                          <Icon className={`h-6 w-6 ${persona.color}`} />
                        </div>
                        <div>
                          <CardTitle>{persona.name}</CardTitle>
                          <CardDescription>{persona.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground">
                        Available Guides ({articles.length})
                      </h4>
                      <div className="space-y-2">
                        {articles.slice(0, 5).map((article) => (
                          <button
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors flex items-center justify-between group"
                          >
                            <span className="text-sm">{article.title}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          </button>
                        ))}
                        {articles.length > 5 && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            +{articles.length - 5} more articles
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
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

function ArticleCard({ article, onClick }: { article: HelpArticle; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <Badge variant="secondary" className="text-xs">
          {article.category}
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <h3 className="font-medium group-hover:text-primary transition-colors">
        {article.title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
        {article.keywords.slice(0, 3).join(", ")}
      </p>
    </button>
  )
}

function FeaturedArticleCard({ article, onClick }: { article: HelpArticle; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-5 rounded-lg border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Rocket className="h-4 w-4 text-primary" />
          </div>
          <Badge variant="default" className="text-xs bg-primary">
            Featured
          </Badge>
        </div>
        <ChevronRight className="h-5 w-5 text-primary/70 group-hover:text-primary transition-colors" />
      </div>
      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
        {article.title}
      </h3>
      <p className="text-sm text-muted-foreground">
        {article.keywords.slice(0, 4).join(", ")}
      </p>
    </button>
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
