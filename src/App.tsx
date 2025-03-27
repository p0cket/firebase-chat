import { useState, useEffect } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "./firebase/config"
import { ChatRoom } from "./components/ChatRoom"
import { Auth } from "./components/Auth"
import "./App.css"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <header className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          {/* <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Firebase Chat
          </h1> */}
          {user && (
            <div className="user-info flex items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">
                {user.displayName || user.email}
              </span>
              <button
                onClick={() => auth.signOut()}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main>{user ? <ChatRoom /> : <Auth />}</main>
    </div>
  )
}

export default App
