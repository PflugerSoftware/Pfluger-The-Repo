import { motion } from 'framer-motion';
import { Mail, Send, Building2, MapPin, Lock, Check } from 'lucide-react';
import { useState } from 'react';

const Collaborate: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConfidential, setIsConfidential] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', organization: '', message: '' });
      setIsSubmitted(false);
    }, 3000);
  };

  const partnershipItems = [
    'Collaborative research projects',
    'Educational facility studies',
    'Speaking engagements and workshops',
    'Data sharing and benchmarking'
  ];

  return (
    <div className="px-12 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-bold text-white mb-2">Let's Connect</h1>
        <p className="text-gray-400">
          Interested in partnering on research or learning more about our work?
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-16">
        {/* Contact Form - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div>
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 text-center"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent</h3>
                <p className="text-gray-400">We'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Confidential Toggle */}
                <button
                  type="button"
                  onClick={() => setIsConfidential(!isConfidential)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all ${
                    isConfidential
                      ? 'bg-white text-black'
                      : 'bg-transparent text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isConfidential ? 'Confidential Inquiry' : 'Mark as Confidential'}
                  </span>
                </button>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:border-white focus:outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:border-white focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:border-white focus:outline-none transition-colors"
                    placeholder="School district, institution, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:border-white focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your interest in collaborating..."
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-100 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>

        {/* Contact Info - Right Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-12"
        >
          {/* Partnership Opportunities */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Partnership Opportunities
            </h2>
            <ul className="space-y-2">
              {partnershipItems.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="text-sm text-gray-400"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Research & Benchmarking */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Research & Benchmarking
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Our team explores innovative approaches to educational architecture,
              focusing on student well-being, sustainability, and learning outcomes.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <p className="text-sm text-white">Pfluger Architects</p>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <p className="text-sm text-gray-400">Austin, Texas</p>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <a
                  href="mailto:research@pflugerarchitects.com"
                  className="text-sm text-white hover:text-gray-300 transition-colors"
                >
                  research@pflugerarchitects.com
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Collaborate;
