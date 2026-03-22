import { useState, useMemo } from "react"
import { 
  Search, 
  Moon, 
  Sun, 
  ChevronRight,
  BookOpen,
  Bell,
  X,
  CheckSquare,
  Rocket,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { 
  personas, 
  whatsNew, 
  helpArticles, 
  getArticlesForRole,
  getFeaturedArticles,
  searchArticles,
  type UserRole,
  type HelpArticle
} from "./help-data"

interface HelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("help")
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const userRole = "admin" as UserRole

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) {
      return getArticlesForRole(userRole)
    }
    return searchArticles(searchQuery, userRole)
  }, [searchQuery, userRole])

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

  const handleArticleClick = (article: HelpArticle) => {
    setSelectedArticle(article)
  }

  const handleBack = () => {
    setSelectedArticle(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0">
        {selectedArticle ? (
          <ArticleView 
            article={selectedArticle} 
            onBack={handleBack}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        ) : (
          <>
            <DialogHeader className="p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Help Center
                  </DialogTitle>
                  <DialogDescription>
                    Find answers and learn how to use KidzKave
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="h-8 w-8"
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenChange(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b px-6">
                <TabsTrigger value="help">Help Articles</TabsTrigger>
                <TabsTrigger value="whatsnew">
                  <Bell className="h-4 w-4 mr-2" />
                  What's New
                  {whatsNew.length > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                      {whatsNew.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all">All Guides</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="help" className="mt-0">
                  {searchQuery ? (
                    <SearchResults articles={filteredArticles} onArticleClick={handleArticleClick} />
                  ) : (
                    <div className="space-y-6">
                      {/* Featured Articles */}
                      {getFeaturedArticles(userRole).length > 0 && (
                        <div>
                          <h3 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Recommended for You
                          </h3>
                          <div className="space-y-2">
                            {getFeaturedArticles(userRole).map((article) => (
                              <FeaturedArticleCard 
                                key={article.id} 
                                article={article} 
                                onClick={() => handleArticleClick(article)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Other Articles by Category */}
                      {Object.entries(groupedArticles)
                        .filter(([category]) => category !== "Getting Started")
                        .map(([category, articles]) => (
                        <div key={category}>
                          <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                            {category}
                          </h3>
                          <div className="space-y-2">
                            {articles.map((article) => (
                              <ArticleCard 
                                key={article.id} 
                                article={article} 
                                onClick={() => handleArticleClick(article)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="whatsnew" className="mt-0">
                  <WhatsNewView />
                </TabsContent>

                <TabsContent value="all" className="mt-0">
                  <AllGuidesView onArticleClick={handleArticleClick} />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ArticleCard({ article, onClick }: { article: HelpArticle; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors flex items-center justify-between group"
    >
      <div>
        <h4 className="font-medium group-hover:text-primary transition-colors">
          {article.title}
        </h4>
        <p className="text-sm text-muted-foreground mt-0.5">
          {article.keywords.slice(0, 3).join(", ")}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  )
}

function FeaturedArticleCard({ article, onClick }: { article: HelpArticle; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-colors flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-primary/20">
          <Rocket className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold group-hover:text-primary transition-colors">
            {article.title}
          </h4>
          <p className="text-sm text-muted-foreground">
            {article.keywords.slice(0, 4).join(", ")}
          </p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
    </button>
  )
}

function SearchResults({ articles, onArticleClick }: { articles: HelpArticle[]; onArticleClick: (article: HelpArticle) => void }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium mb-2">No results found</h3>
        <p className="text-sm text-muted-foreground">
          Try a different search term
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-4">
        Found {articles.length} article{articles.length !== 1 ? "s" : ""}
      </p>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} onClick={() => onArticleClick(article)} />
      ))}
    </div>
  )
}

function WhatsNewView() {
  return (
    <div className="space-y-6">
      {whatsNew.map((item, index) => (
        <div 
          key={item.version}
          className={`p-4 rounded-lg border ${index === 0 ? "bg-primary/5 border-primary/20" : "bg-card"}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                v{item.version}
              </span>
              <span className="text-xs text-muted-foreground ml-2">{item.date}</span>
            </div>
          </div>
          <h3 className="font-semibold mb-2">{item.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
          <ul className="space-y-2">
            {item.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckSquare className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function AllGuidesView({ onArticleClick }: { onArticleClick: (article: HelpArticle) => void }) {
  return (
    <div className="space-y-6">
      {personas.map((persona) => {
        const Icon = persona.icon
        const articles = helpArticles.filter(a => a.role === persona.id || a.role === "all")
        
        return (
          <div key={persona.id}>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Icon className={`h-5 w-5 ${persona.color}`} />
              {persona.name}
            </h3>
            <div className="space-y-2">
              {articles.slice(0, 3).map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  onClick={() => onArticleClick(article)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ArticleView({ 
  article, 
  onBack,
  isDarkMode,
  onToggleDarkMode
}: { 
  article: HelpArticle
  onBack: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}) {
  return (
    <>
      <DialogHeader className="p-6 pb-4 border-b">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="pl-0">
            ← Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              className="h-8 w-8"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <DialogTitle className="text-xl">{article.title}</DialogTitle>
          <DialogDescription className="mt-1">
            {article.category} • {article.role === "all" ? "All users" : article.role}
          </DialogDescription>
        </div>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto p-6">
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: simpleMarkdown(article.content) }}
        />
      </div>
    </>
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
    .replace(/\n\n/g, '</p><p class="my-3">')
    .replace(/^(?!<[htlp])/gm, '<p class="my-3">')
}
