import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { 
  Search,
  BookOpen,
  Bell,
  Filter,
  Users,
  Star,
  Rocket,
  ChevronRight,
  CheckSquare
} from "lucide-react"

interface GuidesSectionProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedRole: UserRole | "all"
  onArticleSelect: (article: HelpArticle) => void
}

export function GuidesSection({ searchQuery, onSearchChange, selectedRole, onArticleSelect }: GuidesSectionProps) {
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

  return (
    <div className="space-y-8">
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
                onClick={() => onArticleSelect(article)}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
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
                    onClick={() => onArticleSelect(article)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {Object.entries(groupedArticles).map(([category, articles]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    onClick={() => onArticleSelect(article)}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export function WhatsNewSection() {
  return (
    <div className="space-y-6">
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
    </div>
  )
}

interface PersonasSectionProps {
  selectedRole: UserRole | "all"
  onRoleChange: (role: UserRole | "all") => void
  onArticleSelect: (article: HelpArticle) => void
}

export function PersonasSection({ selectedRole, onRoleChange, onArticleSelect }: PersonasSectionProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter by your role:</span>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedRole === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onRoleChange("all")}
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
                onClick={() => onRoleChange(persona.id)}
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
                        onClick={() => onArticleSelect(article)}
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
