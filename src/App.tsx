import { auth } from "./firebase/config"
import { Auth } from "./components/Auth"
import "./App.css"
import LobbyHome from "./components/LobbyHome"
import { LobbyContextProvider } from "./components/providers/LobbyContext"
import { useUser } from './hooks/use-context';

function App() {
  const { loading, user } = useUser()


  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <header className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
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

      {/* <main>{user ? <ChatRoom /> : <Auth />}</main> */}
      <main>{user ? (
        <LobbyContextProvider>
          <LobbyHome />
        </LobbyContextProvider>
        ) : <Auth />}</main>
    </div>
  )
}

export default App
