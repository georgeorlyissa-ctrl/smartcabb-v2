import { motion } from '../lib/motion';
import { ChatWidget } from '../components/ChatWidget';
import { ProfessionalFooter } from '../components/ProfessionalFooter';
import { SiteNavigation } from '../components/SiteNavigation';
import { useLanguage } from '../contexts/LanguageContext';

export function AboutPage() {
  const { t, language } = useLanguage();

  // 🎨 VOS IMAGES PERSONNALISÉES - Stockées dans GitHub /public/about/
  // ⚠️ INSTRUCTIONS POUR AJOUTER VOS IMAGES :
  // 1. Créez un dossier "about" dans votre dossier "public" sur GitHub
  // 2. Téléchargez vos 3 images dans ce dossier
  // 3. Nommez-les : mission.jpg, vision.jpg, value1.jpg, value2.jpg, value3.jpg, value4.jpg
  // 4. Le code ci-dessous les utilisera automatiquement

  const values = [
    {
      image: '/about/value1.jpg', // ✅ Votre image Excellence
      titleFR: 'Excellence',
      titleEN: 'Excellence',
      descFR: 'Nous visons l\'excellence dans chaque aspect de notre service',
      descEN: 'We aim for excellence in every aspect of our service'
    },
    {
      image: '/about/value2.jpg', // ✅ Votre image Confiance
      titleFR: 'Confiance',
      titleEN: 'Trust',
      descFR: 'La confiance de nos clients est notre priorité absolue',
      descEN: 'Our customers\' trust is our top priority'
    },
    {
      image: '/about/value3.jpg', // ✅ Votre image Innovation
      titleFR: 'Innovation',
      titleEN: 'Innovation',
      descFR: 'Nous innovons constamment pour améliorer votre expérience',
      descEN: 'We constantly innovate to improve your experience'
    },
    {
      image: '/about/value4.jpg', // ✅ Votre image Local
      titleFR: 'Local',
      titleEN: 'Local',
      descFR: '100% congolais, créé pour répondre aux besoins locaux',
      descEN: '100% Congolese, created to meet local needs'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif !important; }
        
        .gradient-text {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Navigation */}
      <SiteNavigation />

      {/* Hero - SANS BADGE */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-blue-50"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-black mb-6">
              {language === 'fr' ? 'À propos de SmartCabb' : 'About SmartCabb'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'fr' 
                ? 'La première plateforme congolaise de transport intelligent, créée par des Congolais pour les Congolais'
                : 'The first Congolese smart transportation platform, created by Congolese for Congolese'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision - CARTES CÔTE À CÔTE SANS PHOTOS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative p-10 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100"
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-200/30 rounded-full blur-3xl"></div>
              
              <div className="relative">
                {/* Icon */}
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                {/* Title */}
                <h2 className="text-4xl font-black mb-6 text-gray-900">
                  {language === 'fr' ? 'Notre mission' : 'Our mission'}
                </h2>
                
                {/* Description */}
                <p className="text-lg text-gray-700 leading-relaxed">
                  {language === 'fr'
                    ? 'Révolutionner le transport en RD Congo en offrant une solution moderne, sûre et accessible à tous les Congolais, avec des tarifs transparents et un service irréprochable.'
                    : 'Revolutionize transportation in DR Congo by offering a modern, safe and accessible solution to all Congolese, with transparent pricing and impeccable service.'}
                </p>
              </div>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative p-10 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100"
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-200/30 rounded-full blur-3xl"></div>
              
              <div className="relative">
                {/* Icon */}
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                
                {/* Title */}
                <h2 className="text-4xl font-black mb-6 text-gray-900">
                  {language === 'fr' ? 'Notre vision' : 'Our vision'}
                </h2>
                
                {/* Description */}
                <p className="text-lg text-gray-700 leading-relaxed">
                  {language === 'fr'
                    ? 'Devenir le leader du transport intelligent en Afrique centrale, en connectant toutes les grandes villes de la RDC et en créant un écosystème de mobilité moderne et durable.'
                    : 'Become the leader of smart transportation in Central Africa, connecting all major cities in the DRC and creating a modern and sustainable mobility ecosystem.'}
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Values - ANIMATION SÉQUENTIELLE (l'un après l'autre) + VOS IMAGES */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">
              {t('about.values')}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'fr'
                ? 'Les principes qui guident notre action au quotidien'
                : 'The principles that guide our daily actions'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="p-8 bg-white rounded-2xl shadow-lg text-center hover:shadow-xl transition-all overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2, // ✨ Animation séquentielle: chaque carte apparaît 0.2s après la précédente
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
              >
                {/* Image au lieu de l'icône */}
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
                  <img 
                    src={value.image} 
                    alt={value.titleFR} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-black mb-2">
                  {language === 'fr' ? value.titleFR : value.titleEN}
                </h3>
                <p className="text-gray-600">
                  {language === 'fr' ? value.descFR : value.descEN}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-br from-cyan-500 to-cyan-600">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '10,000+', labelFR: 'Courses complétées', labelEN: 'Completed rides' },
              { value: '500+', labelFR: 'Chauffeurs actifs', labelEN: 'Active drivers' },
              { value: '5,000+', labelFR: 'Clients satisfaits', labelEN: 'Happy clients' },
              { value: '4.8/5', labelFR: 'Note moyenne', labelEN: 'Average rating' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl font-black mb-2">{stat.value}</div>
                <div className="text-cyan-100 font-semibold">
                  {language === 'fr' ? stat.labelFR : stat.labelEN}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <ProfessionalFooter />

      <ChatWidget />
    </div>
  );
}
