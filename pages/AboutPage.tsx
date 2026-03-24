import { motion } from '../lib/motion';
import { ChatWidget } from '../components/ChatWidget';
import { ProfessionalFooter } from '../components/ProfessionalFooter';
import { SiteNavigation } from '../components/SiteNavigation';
import { useLanguage } from '../contexts/LanguageContext';

export function AboutPage() {
  const { t, language } = useLanguage();

  // 🎨 VALEURS AVEC ICÔNES 3D STYLISÉES
  const values = [
    {
      icon: '🎯', // Excellence - Cible
      titleFR: 'Excellence',
      titleEN: 'Excellence',
      descFR: 'Nous visons l\'excellence dans chaque aspect de notre service',
      descEN: 'We aim for excellence in every aspect of our service',
      gradient: 'from-blue-400 to-blue-600',
      shadow: 'shadow-blue-500/50'
    },
    {
      icon: '🤝', // Confiance - Poignée de main
      titleFR: 'Confiance',
      titleEN: 'Trust',
      descFR: 'La confiance de nos clients est notre priorité absolue',
      descEN: 'Our customers\' trust is our top priority',
      gradient: 'from-green-400 to-green-600',
      shadow: 'shadow-green-500/50'
    },
    {
      icon: '💡', // Innovation - Ampoule
      titleFR: 'Innovation',
      titleEN: 'Innovation',
      descFR: 'Nous innovons constamment pour améliorer votre expérience',
      descEN: 'We constantly innovate to improve your experience',
      gradient: 'from-yellow-400 to-orange-500',
      shadow: 'shadow-yellow-500/50'
    },
    {
      icon: '🇨🇩', // Local - Drapeau RDC
      titleFR: 'Local',
      titleEN: 'Local',
      descFR: '100% congolais, créé pour répondre aux besoins locaux',
      descEN: '100% Congolese, created to meet local needs',
      gradient: 'from-cyan-400 to-cyan-600',
      shadow: 'shadow-cyan-500/50'
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

        /* ✨ ANIMATIONS 3D POUR LES ICÔNES */
        @keyframes float3d {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: translateY(-15px) rotateX(10deg) rotateY(10deg);
          }
        }

        @keyframes pulse3d {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
          }
        }

        @keyframes rotate3d {
          0% {
            transform: perspective(1000px) rotateY(0deg);
          }
          100% {
            transform: perspective(1000px) rotateY(360deg);
          }
        }

        .icon-3d {
          animation: float3d 3s ease-in-out infinite;
          transition: all 0.3s ease;
          transform-style: preserve-3d;
          perspective: 1000px;
        }

        .icon-3d:hover {
          animation: rotate3d 1s ease-in-out;
          transform: scale(1.1) translateY(-5px);
        }

        .value-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .value-card:hover {
          transform: translateY(-10px) scale(1.02);
        }

        .value-card:hover .icon-3d {
          animation: pulse3d 1s ease-in-out infinite;
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
                className="value-card p-8 bg-white rounded-2xl shadow-lg text-center hover:shadow-2xl transition-all overflow-visible relative group"
                initial={{ opacity: 0, y: 80, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.7, 
                  delay: index * 0.25, // ✨ Animation séquentielle améliorée
                  ease: [0.34, 1.56, 0.64, 1], // Bounce effect
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true, margin: "-50px" }}
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10`}></div>

                {/* Icône 3D avec effet de lévitation */}
                <div className="relative mb-6 flex justify-center">
                  <div className={`icon-3d w-28 h-28 rounded-full bg-gradient-to-br ${value.gradient} ${value.shadow} shadow-2xl flex items-center justify-center text-6xl relative`}>
                    {/* Cercle de fond avec effet glow */}
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                    
                    {/* Emoji avec perspective 3D */}
                    <span className="relative z-10 drop-shadow-2xl" style={{
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {value.icon}
                    </span>

                    {/* Anneaux décoratifs */}
                    <div className="absolute -inset-2 rounded-full border-2 border-white/30 animate-ping opacity-20"></div>
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-3 text-gray-900">
                  {language === 'fr' ? value.titleFR : value.titleEN}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {language === 'fr' ? value.descFR : value.descEN}
                </p>

                {/* Decorative bottom line */}
                <div className={`mt-6 h-1 w-16 mx-auto rounded-full bg-gradient-to-r ${value.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
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
