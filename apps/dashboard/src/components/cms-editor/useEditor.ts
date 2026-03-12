import { useState, useEffect, useCallback } from 'react'
import type { Block, BlockContent } from './types'

export function useEditor(initialBlocks: any[] = []) {
  const [localBlocks, setLocalBlocks] = useState<Block[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  // Initialize blocks when data is fetched
  useEffect(() => {
    if (initialBlocks?.length > 0 && localBlocks.length === 0) {
      setLocalBlocks(initialBlocks.map((b: any) => ({
        ...b,
        content: typeof b.content === 'string' ? JSON.parse(b.content) : b.content
      })))
    }
  }, [initialBlocks])

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
      default:
        content = { text: 'New content block.' }
    }

    const newBlock: Block = {
      id: `temp-${Date.now()}`,
      type,
      content,
    }
    setLocalBlocks(prev => [...prev, newBlock])
    setSelectedBlockId(newBlock.id)
    setRightSidebarOpen(true)
  }, [])

  const updateBlockContent = useCallback((id: string, content: BlockContent) => {
    setLocalBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b))
  }, [])

  const updateBlockStyles = useCallback((id: string, styles: any) => {
    setLocalBlocks(prev => prev.map(b => 
      b.id === id ? { ...b, content: { ...b.content, styles } } : b
    ))
  }, [])

  const removeBlock = useCallback((id: string) => {
    if (id === selectedBlockId) setSelectedBlockId(null)
    setLocalBlocks(prev => prev.filter(b => b.id !== id))
  }, [selectedBlockId])

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
    removeBlock
  }
}