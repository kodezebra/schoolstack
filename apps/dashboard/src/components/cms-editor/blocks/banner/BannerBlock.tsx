interface BannerContent {
  title?: string
  eyebrow?: string
  subtitle?: string
  height?: 'small' | 'medium' | 'large'
  showBreadcrumb?: boolean
  backgroundColor?: string
  image?: string
  textureImage?: string
  offsetImage?: string
  showOffsetImage?: boolean
  overlayColor?: string
  overlayHex?: string
  showDivider?: boolean
  styles?: { paddingY?: number }
}

export function BannerBlock({ content }: { content: BannerContent }) {
  const heightMap = {
    small: '240px',
    medium: '360px',
    large: '480px'
  }
  
  const bannerHeight = heightMap[content.height || 'medium'] || '360px'
  const titleSize = content.height === 'large' ? 'text-5xl md:text-7xl' : content.height === 'medium' ? 'text-4xl md:text-5xl' : 'text-3xl'
  const showOffsetImage = content.showOffsetImage && content.offsetImage
  const hasImage = !!content.image

  return (
    <div 
      className="w-full relative flex items-center overflow-hidden bg-surface-container-low"
      style={{ height: bannerHeight }}
    >
      {content.image && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${content.image}')` }}
        />
      )}
      
      {content.textureImage && (
        <div 
          className="absolute inset-0 opacity-15"
          style={{ backgroundImage: `url('${content.textureImage}')` }}
        />
      )}
      
      <div 
        className={`absolute inset-0 ${hasImage ? 'bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70' : 'bg-gradient-to-br from-primary/10 via-surface-container-low to-primary-container/10'}`}
      />

      {hasImage && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/20" />
      )}
      
      {showOffsetImage && (
        <div 
          className="absolute -bottom-12 right-12 hidden lg:block w-64 h-80 rounded-2xl overflow-hidden shadow-2xl rotate-3 border-8 border-white z-20"
          style={{ bottom: '-48px' }}
        >
          <img src={content.offsetImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-6 w-full relative z-10 text-center">
        {content.eyebrow && (
          <p className={`font-label text-sm uppercase tracking-[0.35em ${hasImage ? 'text-white/80' : 'text-secondary'} mb-6`}>
            {content.eyebrow}
          </p>
        )}
        <h1 className={`font-headline font-bold ${hasImage ? 'text-white' : 'text-primary'} ${titleSize} tracking-tight leading-[1.1]`}>
          {content.title || 'Page Title'}
        </h1>
        {content.showDivider !== false && (
          <div className={`mt-8 h-1.5 w-32 mx-auto rounded-full ${hasImage ? 'bg-white' : 'bg-primary'}`}></div>
        )}
        {content.subtitle && (
          <p className={`mt-8 font-body text-xl leading-relaxed max-w-2xl mx-auto ${hasImage ? 'text-white/80' : 'text-secondary'}`}>
            {content.subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
