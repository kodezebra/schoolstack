import { getPadding } from '../utils'

export const ContactForm = ({ content }: { content: any }) => {
  const formId = `contact-form-${Math.random().toString(36).substr(2, 9)}`

  return (
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
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
            <form 
              id={formId}
              className="contact-form space-y-6" 
              action="/api/contact" 
              method="post"
            >
              <div className="form-fields space-y-6 transition-opacity duration-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your name"
                    className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Your message"
                    className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="submit-btn w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="btn-text">Send Message</span>
              </button>
              <div className="form-message text-sm text-center mt-4 hidden" role="alert"></div>
            </form>
            
            <div className="success-card hidden text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h4>
              <p className="text-slate-600 dark:text-slate-400">Thank you! We will get back to you soon.</p>
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          var form = document.querySelector('.contact-form');
          if (!form) return;
          
          var formFields = form.querySelector('.form-fields');
          var inputs = form.querySelectorAll('.form-input');
          var btn = form.querySelector('.submit-btn');
          var btnText = btn.querySelector('.btn-text');
          var messageEl = form.querySelector('.form-message');
          var successCard = form.parentElement.querySelector('.success-card');
          var originalText = btnText.textContent;
          
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect data manually
            var data = {};
            inputs.forEach(function(input) {
              data[input.name] = input.value;
            });
            console.log('Submitting data:', data);
            
            // Disable fields and button
            inputs.forEach(function(input) { input.disabled = true; });
            btn.disabled = true;
            btnText.textContent = 'Sending...';
            
            // Add timeout fallback
            var timeoutId = setTimeout(function() {
              inputs.forEach(function(input) { input.disabled = false; });
              btn.disabled = false;
              btnText.textContent = originalText;
              messageEl.textContent = 'Request timed out. Please try again.';
              messageEl.classList.remove('hidden');
              messageEl.classList.add('text-red-600');
            }, 10000);
            messageEl.classList.add('hidden');
            
            var formData = new FormData();
            for (var key in data) {
              formData.append(key, data[key]);
            }
            
            fetch(form.action, {
              method: 'POST',
              body: formData
            })
            .then(function(response) { 
              return response.json(); 
              })
            .then(function(data) {
              clearTimeout(timeoutId);
              if (data.success) {
                formFields.style.opacity = '0';
                btn.style.display = 'none';
                setTimeout(function() {
                  formFields.style.display = 'none';
                  successCard.classList.remove('hidden');
                  successCard.classList.add('animate-fade-in');
                  successCard.setAttribute('tabindex', '-1');
                  successCard.focus();
                }, 200);
              } else {
                inputs.forEach(function(input) { input.disabled = false; });
                btn.disabled = false;
                btnText.textContent = originalText;
                messageEl.textContent = data.error || 'Something went wrong. Please try again.';
                messageEl.classList.remove('hidden', 'text-green-600', 'dark:text-green-400');
                messageEl.classList.add('text-red-600', 'dark:text-red-400');
                messageEl.focus();
              }
            })
            .catch(function(err) {
              clearTimeout(timeoutId);
              console.error('Form submission error:', err);
              inputs.forEach(function(input) { input.disabled = false; });
              btn.disabled = false;
              btnText.textContent = originalText;
              messageEl.textContent = 'Something went wrong. Please try again.';
              messageEl.classList.remove('hidden', 'text-green-600', 'dark:text-green-400');
              messageEl.classList.add('text-red-600', 'dark:text-red-400');
              messageEl.focus();
            });
          });
        })();
      `}} />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}} />
    </section>
  )
}
