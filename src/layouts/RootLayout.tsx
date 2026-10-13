import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { useState } from "react"

const RootLayout = () => {

  const [searchTerm, setSearchTerm] = useState('')

  return (
    <>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* this function renders the children in routes function */}
      <main>
        <Outlet context={{ searchTerm }} />
      </main>

      <Footer />
    </>
  )
}

export default RootLayout
