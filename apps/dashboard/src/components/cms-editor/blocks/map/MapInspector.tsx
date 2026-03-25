import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Section, Field } from '../common'
import { ExternalLink, Info, MapPin, Loader2, AlertTriangle } from 'lucide-react'

export function MapInspector({
  content,
  onUpdateContent,
}: {
  content: any,
  onUpdateContent: (c: any) => void,
}) {
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setDetectingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onUpdateContent({
          ...content,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        })
        setDetectingLocation(false)
      },
      (error) => {
        let message = 'Unable to get location'
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied. Please allow location access or enter coordinates manually.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location unavailable. Enter coordinates manually.'
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out. Try again or enter manually.'
        }
        setLocationError(message)
        setDetectingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <>
      <Section title="Map Settings">
        <Field label="Section Title (optional)">
          <Input 
            value={content.title || ''} 
            onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} 
            placeholder="e.g. Visit Our Campus"
          />
        </Field>

        <Field label="Map Height">
          <div className="flex gap-2">
            {['small', 'medium', 'large', 'full'].map((size) => (
              <button
                key={size}
                onClick={() => onUpdateContent({ ...content, height: size })}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  content.height === size 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </Field>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showDirections"
            checked={content.showDirections ?? true}
            onChange={(e) => onUpdateContent({ ...content, showDirections: e.target.checked })}
            className="rounded border-slate-300"
          />
          <label htmlFor="showDirections" className="text-xs font-medium text-slate-700">
            Show "Get Directions" button
          </label>
        </div>

        {content.showDirections && (
          <Field label="Directions Button Text">
            <Input 
              value={content.directionsLabel || 'Get Directions'} 
              onChange={(e) => onUpdateContent({ ...content, directionsLabel: e.target.value })} 
              placeholder="Get Directions"
            />
          </Field>
        )}
      </Section>

      <Section title="Location Coordinates">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Best for mobile users at the school:
            </p>
          </div>
          
          <Button 
            onClick={detectLocation} 
            disabled={detectingLocation}
            variant="outline"
            className="w-full gap-2"
          >
            {detectingLocation ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Getting location...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                Detect My Location
              </>
            )}
          </Button>

          <p className="text-xs text-amber-600 dark:text-amber-500">
            Walk to your school entrance on your phone and tap the button above for best accuracy.
          </p>

          {locationError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">
                {locationError}
              </p>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-xs text-muted-foreground">or enter manually</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude">
            <Input 
              value={content.latitude || ''} 
              onChange={(e) => onUpdateContent({ ...content, latitude: e.target.value })} 
              placeholder="0.3476"
              className="font-mono text-xs"
            />
          </Field>
          <Field label="Longitude">
            <Input 
              value={content.longitude || ''} 
              onChange={(e) => onUpdateContent({ ...content, longitude: e.target.value })} 
              placeholder="32.5825"
              className="font-mono text-xs"
            />
          </Field>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
              How to find coordinates manually:
            </p>
          </div>
          
          <ol className="text-xs text-blue-600 dark:text-blue-500 space-y-1 list-decimal list-inside">
            <li>Open Google Maps (maps.google.com)</li>
            <li>Search for your school location</li>
            <li>Right-click on the exact spot</li>
            <li>Click the first option to copy coordinates</li>
          </ol>
          
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Open Google Maps
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {(content.latitude && content.longitude) && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">
              ✓ Coordinates configured
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 font-mono mt-1">
              {content.latitude}, {content.longitude}
            </p>
          </div>
        )}
      </Section>
    </>
  )
}
