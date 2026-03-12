import { useState, useEffect, useCallback, useRef } from 'react'
import type { Block, BlockContent } from './types'

const MAX_HISTORY = 50
const STORAGE_KEY = 'cms_editor_history'

export function useEditor(initialBlocks: any[] = []) {
  const [localBlocks, setLocalBlocks] = useState<Block[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  
  // Undo/Redo history
  const [history, setHistory] = useState<Block[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const skipSaveRef = useRef(false)

  // Initialize blocks when data is fetched
  useEffect(() => {
    if (initialBlocks?.length > 0 && localBlocks.length === 0) {
      const parsed = initialBlocks.map((b: any) => ({
        ...b,
        content: typeof b.content === 'string' ? JSON.parse(b.content) : b.content
      }))
      setLocalBlocks(parsed)
      setHistory([parsed])
      setHistoryIndex(0)
    }
  }, [initialBlocks])

  // Save to history for undo/redo
  const saveToHistory = useCallback((blocks: Block[]) => {
    if (skipSaveRef.current) return
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      const updated = [...newHistory, blocks]
      return updated.slice(-MAX_HISTORY)
    })
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1))
  }, [historyIndex])

  const addBlock = useCallback((type: string) => {
    let content: BlockContent = {}

    switch (type) {
      case 'navbar':
        content = { logoText: 'KZ Cloud', links: [{ label: 'Features', href: '#' }, { label: 'About', href: '#' }], cta: { label: 'Get Started', href: '#' } }
        break
      case 'hero':
        content = { title: 'Design Your Future with Precision', subtitle: 'Elevate your digital presence with our modern, professional solutions.', primaryCta: { label: 'Start Building' }, secondaryCta: { label: 'View Portfolio' } }
        break
      case 'features':
        content = { tagline: 'Expertise', title: 'Tailored Solutions', subtitle: 'High-quality services for digital-first businesses.', items: [{ icon: 'zap', title: 'Strategy', text: 'Data-driven strategies.' }, { icon: 'palette', title: 'Design', text: 'User-centric designs.' }, { icon: 'code', title: 'Web', text: 'Scalable applications.' }] }
        break
      case 'content':
        content = { title: 'About Our Vision', text1: 'Innovation at the core.', text2: 'We build partnerships.', features: ['10+ Years Excellence', 'Global Network'], cta: { label: 'Learn More', href: '#' } }
        break
      case 'stats':
        content = { items: [{ value: '500+', label: 'Clients' }, { value: '12M+', label: 'Users' }, { value: '45', label: 'Countries' }, { value: '99.9%', label: 'Uptime' }] }
        break
      case 'team':
        content = { tagline: 'Our Team', title: 'Meet the Minds', subtitle: 'Dedicated to excellence.', members: [{ name: 'Alex Rivera', role: 'CEO', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBR9L2w1l_K_qS-1v2n_T_S8u9R6f4z_W7v7m1q_W8v8_v8_v8_v8_v8_v8_v8_v8_v8_v8_v8_v8' }] }
        break
      case 'testimonials':
        content = { tagline: 'Testimonials', title: 'What They Say', items: [{ name: 'Michael Ross', role: 'Founder', text: 'Remarkable partner.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWlQHMA1cEx0gKL790g0ZSQtK4uG-cWX8kJuM39rjHoHNd01FvsZN99YlTL3e4EBJFB5DNqij2zFdUf2vdaza3FM6jevuL8ikrAzIs4QrpTLRjYCO_AXeE8LLATNPDFLjehbpSDRKmTJK2yR3a4yW-LGwrdRMKU5IeHchRiaXn9XIpESZpIkocuwMAR0WXHgWImcmHBsZ47hSVe07kw2625YnfxDihv7ZlnSAr7IjAXe2Kwwg1k-u6xX4lnDk92_Ewr127rKukMzc' }] }
        break
      case 'cta':
        content = { title: 'Ready to Revolutionize?', subtitle: 'Join hundreds of forward-thinking companies.', ctaLabel: 'Start Today' }
        break
      case 'footer':
        content = { logoText: 'KZ Cloud', description: 'Empowering businesses with cutting-edge solutions.' }
        break
      case 'steps':
        content = { tagline: 'How It Works', title: 'Our Process', subtitle: 'Simple steps to get started.', items: [{ icon: 'zap', title: 'Step 1', description: 'First step description.' }, { icon: 'settings', title: 'Step 2', description: 'Second step description.' }] }
        break
      case 'values':
        content = { tagline: 'Our Values', title: 'What We Believe', subtitle: 'Core principles guiding us.', items: [{ icon: 'heart', title: 'Integrity', description: 'We do the right thing.' }, { icon: 'users', title: 'Teamwork', description: 'Together we achieve more.' }] }
        break
      case 'splitContent':
        content = { eyebrow: 'Since 2024', title: 'About Our Vision', description: 'We believe in innovation.', image: '', cta: { label: 'Learn More', href: '#' }, imagePosition: 'left' }
        break
      case 'videoGallery':
        content = { tagline: 'Portfolio', title: 'Video Showcase', subtitle: 'See our work in action.', items: [{ title: 'Project Demo', thumbnail: '', videoUrl: '' }] }
        break
      case 'faq':
        content = { tagline: 'FAQ', title: 'Common Questions', subtitle: 'Find answers here.', items: [{ question: 'How do I get started?', answer: 'Contact us to begin.' }] }
        break
      default:
        content = { text: 'New content block.' }
    }

    const newBlock: Block = {
      id: `temp-${Date.now()}`,
      type,
      content,
    }
    const newBlocks = [...localBlocks, newBlock]
    setLocalBlocks(newBlocks)
    saveToHistory(newBlocks)
    setSelectedBlockId(newBlock.id)
    setRightSidebarOpen(true)
  }, [localBlocks, saveToHistory])

  const updateBlockContent = useCallback((id: string, content: BlockContent) => {
    const newBlocks = localBlocks.map(b => b.id === id ? { ...b, content } : b)
    setLocalBlocks(newBlocks)
    saveToHistory(newBlocks)
  }, [localBlocks, saveToHistory])

  const updateBlockStyles = useCallback((id: string, styles: any) => {
    const newBlocks = localBlocks.map(b =>
      b.id === id ? { ...b, content: { ...b.content, styles } } : b
    )
    setLocalBlocks(newBlocks)
    saveToHistory(newBlocks)
  }, [localBlocks, saveToHistory])

  const removeBlock = useCallback((id: string) => {
    if (id === selectedBlockId) setSelectedBlockId(null)
    const newBlocks = localBlocks.filter(b => b.id !== id)
    setLocalBlocks(newBlocks)
    saveToHistory(newBlocks)
  }, [localBlocks, selectedBlockId, saveToHistory])

  const duplicateBlock = useCallback((id: string) => {
    const block = localBlocks.find(b => b.id === id)
    if (!block) return
    
    const index = localBlocks.findIndex(b => b.id === id)
    const newBlock: Block = {
      ...block,
      id: `temp-${Date.now()}`,
      content: JSON.parse(JSON.stringify(block.content)) // Deep clone
    }
    
    const newBlocks = [...localBlocks]
    newBlocks.splice(index + 1, 0, newBlock)
    setLocalBlocks(newBlocks)
    saveToHistory(newBlocks)
    setSelectedBlockId(newBlock.id)
  }, [localBlocks, saveToHistory])

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= localBlocks.length) return
    
    const newBlocks = [...localBlocks]
    const [removed] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, removed)
    setLocalBlocks(newBlocks)
    saveToHistory(newBlocks)
  }, [localBlocks, saveToHistory])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      skipSaveRef.current = true
      setHistoryIndex(historyIndex - 1)
      setLocalBlocks(history[historyIndex - 1])
      setTimeout(() => { skipSaveRef.current = false }, 0)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      skipSaveRef.current = true
      setHistoryIndex(historyIndex + 1)
      setLocalBlocks(history[historyIndex + 1])
      setTimeout(() => { skipSaveRef.current = false }, 0)
    }
  }, [history, historyIndex])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) {
          setHistory(parsed)
          setHistoryIndex(parsed.length - 1)
          setLocalBlocks(parsed[parsed.length - 1])
        }
      }
    } catch {}
  }, [])

  return {
    localBlocks,
    setLocalBlocks,
    selectedBlockId,
    setSelectedBlockId,
    leftSidebarOpen,
    setLeftSidebarOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
    addBlock,
    updateBlockContent,
    updateBlockStyles,
    removeBlock,
    duplicateBlock,
    moveBlock,
    undo,
    redo,
    canUndo,
    canRedo
  }
}
