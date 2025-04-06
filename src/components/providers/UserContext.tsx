import { useState, useEffect } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "../../firebase/config"
import { UserContext } from '../../contexts'


export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])
  return <UserContext.Provider value={{ user, loading }}>{children}</UserContext.Provider>
}

