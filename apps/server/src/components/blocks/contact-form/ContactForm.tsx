import { getPadding } from '../utils'

export const ContactForm = ({ content }: { content: any }) => (
  <section className="py-32 bg-white dark:bg-slate-950" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="max-w-md">
            <h2 className="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
              {content.tagline || "Contact Us"}
            </h2>
            <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-6">
              {content.title || "Get In Touch"}
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium mb-8">
              {content.subtitle || "We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
            </p>
          </div>
          {content.contactInfo && (
            <div className="space-y-6">
              {content.contactInfo.address && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <i data-lucide="map-pin" className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Address</h4>
                    <p className="text-slate-600 dark:text-slate-400">{content.contactInfo.address}</p>
                  </div>
                </div>
              )}
              {content.contactInfo.email && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <i data-lucide="mail" className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Email</h4>
                    <a href={`mailto:${content.contactInfo.email}`} className="text-slate-600 dark:text-slate-400 hover:text-primary">
                      {content.contactInfo.email}
                    </a>
                  </div>
                </div>
              )}
              {content.contactInfo.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <i data-lucide="phone" className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Phone</h4>
                    <a href={`tel:${content.contactInfo.phone}`} className="text-slate-600 dark:text-slate-400 hover:text-primary">
                      {content.contactInfo.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
          <form className="space-y-6" action={content.submitTo || '/api/contact'} method="post">
            {content.fields?.map((field: any, i: number) => (
              <div key={i}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    required={field.required}
                    rows={field.rows || 4}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : field.type === 'select' ? (
                  <select
                    name={field.name}
                    required={field.required}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">{field.placeholder || 'Select an option'}</option>
                    {field.options?.map((opt: string, j: number) => (
                      <option key={j} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              {content.submitLabel || 'Send Message'}
            </button>
            {content.successMessage && (
              <p className="text-sm text-green-600 dark:text-green-400 text-center mt-4">
                {content.successMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  </section>
)
