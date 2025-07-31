"use client"
import { Link } from "react-router-dom"
import { useState } from "react"
import { Menu, X, Github } from "lucide-react"
import handleGithubLogin from "../utils/handleGithubLogin"
import handleLogout from "../utils/handleLogout"
import { useAuth } from "./Layout"

const Navbar = () => {
  const auth = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="w-full bg-black">
      <div className="max-w-7xl mx-auto px-6 py-1 lg:px-40">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-24 w-24" />
            <Link
              to="/dashboard"
              className="text-white text-2xl font-bold hover:text-gray-300 transition-colors duration-200 flex items-center gap-3"
            >
              Obscuron
            </Link>
          </div>
          {/* Auth Button */}
          <div className="hidden md:block">
            <button
              className="group relative overflow-hidden border border-white/20 rounded-lg transition-all duration-300 hover:border-white hover:shadow-lg hover:shadow-white/10"
              onClick={
                !auth?.authStatus
                  ? handleGithubLogin
                  : () => {
                    handleLogout()
                    auth?.setAuthStatus(null)
                  }
              }
            >
              <div className="relative flex items-center gap-2 bg-black px-6 py-2.5 text-white font-medium transition-all duration-200 group-hover:bg-white group-hover:text-black">
                {!auth?.authStatus && <Github className="w-4 h-4" />}
                {!auth?.authStatus ? "Login with GitHub" : "Logout"}
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black">

            {/* Mobile Auth Button */}
            <div className="pt-4">
              <button
                className="w-full group relative overflow-hidden border border-white/20 rounded-lg transition-all duration-300 hover:border-white"
                onClick={() => {
                  if (!auth?.authStatus) {
                    handleGithubLogin()
                  } else {
                    handleLogout()
                    auth?.setAuthStatus(null)
                  }
                  setIsMenuOpen(false)
                }}
              >
                <div className="relative flex items-center justify-center gap-2 bg-black px-6 py-3 text-white font-medium transition-all duration-200 group-hover:bg-white group-hover:text-black">
                  {!auth?.authStatus && <Github className="w-4 h-4" />}
                  {!auth?.authStatus ? "Login with GitHub" : "Logout"}
                </div>
              </button>
            </div>
          </div>

        )}
      </div>
    </nav >
  )
}

export default Navbar
