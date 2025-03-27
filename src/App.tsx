import { useAuthState } from "react-firebase-hooks/auth"
import "./App.css"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import SignIn from "./components/SignIn"
import SignOut from "./components/SignOut"
import ChatRoom from "./components/ChatRoom"

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

function App() {
  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <h1>Firebase Chat</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  )
}

export default App
