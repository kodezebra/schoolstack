import { getPadding } from '../utils'

export const Map = ({ content }: { content: any }) => {
  const hasCoords = content.latitude && content.longitude
  
  const heightMap: Record<string, string> = {
    small: '300px',
    medium: '400px',
    large: '500px',
    full: '600px'
  }
  
  const mapHeight = heightMap[content.height || 'medium'] || '400px'
  const directionsLabel = content.directionsLabel || 'Get Directions'

  if (!hasCoords) {
    return (
      <section className="py-16 bg-slate-50 dark:bg-slate-900" style={getPadding(content.styles)}>
        <div className="max-w-7xl mx-auto px-4">
          {content.title && (
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">
              {content.title}
            </h2>
          )}
          <div 
            className="bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700"
            style={{ height: mapHeight }}
          >
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Location not configured</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add coordinates in the CMS editor</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const mapUrl = `https://www.google.com/maps?q=${content.latitude},${content.longitude}&z=15&output=embed`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${content.latitude},${content.longitude}`

  return (
    <section className="py-16 bg-white dark:bg-slate-950" style={getPadding(content.styles)}>
      <div className="max-w-7xl mx-auto px-4">
        {content.title && (
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">
            {content.title}
          </h2>
        )}
        
        <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
          <iframe
            src={mapUrl}
            width="100%"
            height={mapHeight}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="School Location"
            className="w-full"
          />
          
          {content.showDirections && (
            <div className="bg-slate-50 dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {directionsLabel}
              </a>
            </div>
          )}
        </div>
        
        <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-4">
          <a 
            href={`https://www.google.com/maps?q=${content.latitude},${content.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            View larger map
          </a>
        </p>
      </div>
    </section>
  )
}
