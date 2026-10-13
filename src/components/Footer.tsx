import { BRAND_NAME } from "../config";
import { useLanguage } from "../contexts/LanguageContext";

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { t } = useLanguage()
  return (
    <footer className="bg-[#1e2939] py-10">
      <div className="mycon flex flex-col items-center gap-3">
        <img
          src="/logo-fergana.jpg"
          alt="Fergana Roses logo"
          className="h-12 w-12 rounded-full object-cover ring-2 ring-white/30 shadow"
        />
        <p className="text-gray-200 text-center text-xl font-[Chillax]">© {currentYear} {BRAND_NAME}. {t('s.footer.rights')}</p>
      </div>
    </footer>
  )
}

export default Footer
