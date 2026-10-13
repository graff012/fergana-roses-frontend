import Hero from "../components/Hero"
import Categories from "../components/Categories"
import FlowerGrid from "../components/FlowerGrid"
import { useOutletContext, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface OutletContext {
  searchTerm: string;
}

const HomePage = () => {

  const context = useOutletContext<OutletContext>()
  const searchTerm = context?.searchTerm || '';
  const location = useLocation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // empty means All

  // Scroll to flowers section if URL hash is present
  useEffect(() => {
    if (location.hash === "#flowers-section") {
      const el = document.getElementById("flowers-section");
      if (el) {
        // use a timeout to ensure the section is rendered
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
      }
    }
  }, [location.hash]);

  // Auto-scroll to grid when category changes
  useEffect(() => {
    if (selectedCategoryId !== undefined) {
      const el = document.getElementById("flowers-section");
      if (el) {
        // timeout ensures the grid has updated/rendered
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
      }
    }
  }, [selectedCategoryId]);

  return (
    <>
      <Hero />
      <Categories
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <FlowerGrid searchTerm={searchTerm} selectedCategoryId={selectedCategoryId} />
    </>
  )
}

export default HomePage
