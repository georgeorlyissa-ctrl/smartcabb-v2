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

      {/* Mission - AVEC VOS IMAGES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-black mb-6">
                {language === 'fr' ? 'Notre Mission' : 'Our Mission'}
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {language === 'fr'
                  ? 'Révolutionner le transport en RD Congo en offrant une solution moderne, sûre et accessible à tous.'
                  : 'Revolutionize transportation in DR Congo by offering a modern, safe and accessible solution to all.'}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {language === 'fr'
                  ? 'Nous croyons que chaque Congolais mérite un transport de qualité. C\'est pourquoi nous avons créé SmartCabb : une plateforme 100% locale qui connecte passagers et chauffeurs en temps réel, avec des tarifs transparents et un service irréprochable.'
                  : 'We believe that every Congolese deserves quality transportation. That\'s why we created SmartCabb: a 100% local platform that connects passengers and drivers in real time, with transparent pricing and impeccable service.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl overflow-hidden shadow-xl">
                <img 
                  src="/about/mission.jpg" 
                  alt="Notre Mission" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision - AVEC VOS IMAGES */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-square bg-gradient-to-br from-orange-100 to-pink-100 rounded-3xl overflow-hidden shadow-xl">
                <img 
                  src="/about/vision.jpg" 
                  alt="Notre Vision" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-5xl font-black mb-6">
                {language === 'fr' ? 'Notre Vision' : 'Our Vision'}
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {language === 'fr'
                  ? 'Devenir le leader du transport intelligent en Afrique centrale.'
                  : 'Become the leader of smart transportation in Central Africa.'}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {language === 'fr'
                  ? 'Nous ne nous arrêtons pas à Kinshasa. Notre ambition est de déployer SmartCabb dans toutes les grandes villes de la RDC et, à terme, dans toute l\'Afrique centrale.'
                  : 'We don\'t stop at Kinshasa. Our ambition is to deploy SmartCabb in all major cities of the DRC and, ultimately, throughout Central Africa.'}
              </p>
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
