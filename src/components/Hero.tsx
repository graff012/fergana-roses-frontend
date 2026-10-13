import { FaArrowRightLong, FaCheck, FaStar } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const Hero = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const MARQUEE_ITEMS = [
    t('s.hero.marquee.0'),
    t('s.hero.marquee.1'),
    t('s.hero.marquee.2'),
    t('s.hero.marquee.3'),
    t('s.hero.marquee.4'),
    t('s.hero.marquee.5'),
    t('s.hero.marquee.6'),
    t('s.hero.marquee.7'),
  ];

  const TRUST_ITEMS = [
    t('s.hero.trust1'),
    t('s.hero.trust2'),
    t('s.hero.trust3'),
  ];

  // Navigate to the flowers section on HomePage (and handle repeat clicks)
  const goToFlowers = () => {
    const alreadyOnFlowers =
      location.pathname === "/" && location.hash === "#flowers-section";

    if (alreadyOnFlowers) {
      const el = document.getElementById("flowers-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    navigate({ pathname: "/", hash: "#flowers-section" });
  };

  return (
    <section className="bg-[#FAF6EE] overflow-hidden">
      <div className="mycon">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16 py-12 md:py-20">
          {/* Copy */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 border border-[#C9A227]/60 bg-[#C9A227]/10 text-[#7A5C14] text-xs font-semibold uppercase tracking-[0.2em] rounded-full px-4 py-1.5">
              {t('s.hero.eyebrow')}
            </span>

            <h1 className="hero-title text-4xl sm:text-5xl xl:text-6xl text-[#0B3B34] font-semibold leading-[1.08] mt-5">
              {t('s.hero.title1')}
              <br />
              <span className="text-[#A31621]">{t('s.hero.title2')}</span>
            </h1>

            <p className="hero-p text-base md:text-lg text-[#0B3B34]/70 leading-relaxed mt-5 max-w-xl mx-auto lg:mx-0">
              {t('s.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mt-8">
              <button
                onClick={goToFlowers}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#004F44] text-white font-medium hover:bg-[#00695C] hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-[#004F44]/20"
              >
                {t('s.hero.catalogCta')}
                <FaArrowRightLong />
              </button>
              <Link
                to="/cart"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-[#004F44]/25 text-[#004F44] font-medium hover:border-[#004F44] hover:-translate-y-0.5 transition-all duration-200"
              >
                {t('s.hero.cartCta')}
              </Link>
            </div>

            <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 mt-8 text-sm text-[#0B3B34]/80">
              {TRUST_ITEMS.map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#C9A227]/15 text-[#9A7B1A]">
                    <FaCheck className="text-[10px]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className="relative flex-shrink-0">
            <div
              aria-hidden
              className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-[#C9A227]/20 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-[#004F44]/15 blur-3xl"
            />

            <div className="relative bg-[#004F44] p-3 rounded-t-[999px] rounded-b-[2rem] shadow-2xl shadow-[#004F44]/25 ring-1 ring-[#C9A227]/50">
              <div className="bg-[#FFFDF7] px-6 pt-8 pb-6 rounded-t-[999px] rounded-b-[1.6rem] text-center">
                <img
                  src="/logo-fergana.jpg"
                  alt="Fergana Roses emblem"
                  className="h-52 w-52 sm:h-64 sm:w-64 lg:h-72 lg:w-72 rounded-full object-cover ring-4 ring-[#C9A227]/70 shadow-lg mx-auto"
                />
                <div className="flex items-center justify-center gap-1.5 mt-4 text-sm text-[#0B3B34]/70">
                  <FaStar className="text-[#C9A227]" />
                  <FaStar className="text-[#C9A227]" />
                  <FaStar className="text-[#C9A227]" />
                  <FaStar className="text-[#C9A227]" />
                  <FaStar className="text-[#C9A227]" />
                  <span className="ml-1 font-medium">{t('s.hero.lovedBy')}</span>
                </div>
              </div>
            </div>

            {/* Floating seal */}
            <div className="absolute -bottom-5 -right-3 sm:-right-6 h-24 w-24 rounded-full bg-[#A31621] text-[#F7E9C4] flex flex-col items-center justify-center shadow-xl ring-4 ring-[#C9A227] rotate-6">
              <span className="hero-title text-2xl font-semibold leading-none">
                FR
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] mt-1">
                {t('s.hero.seal')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee strip */}
      <div className="bg-[#004F44] border-t border-[#C9A227]/40 py-3 overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-8 pr-8">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="inline-flex items-center gap-8 text-[#F7E9C4]/90 text-sm uppercase tracking-[0.25em] whitespace-nowrap"
            >
              {name}
              <span className="text-[#C9A227]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
