import { createContext } from "react"
import { User } from 'firebase/auth'
import { Lobby, LobbyMember } from "./types/types"

type UserContextType = {
  user: User | null,
  loading: boolean
}
export const UserContext = createContext<UserContextType>({ user: null, loading: false })

type LobbyContextType = {
  lobby: Lobby | null,
  loading: boolean
  setLobbyCode: (lobbyCode: string) => void
  createLobby: (host: LobbyMember) => void
}
export const LobbyContext = createContext<LobbyContextType>({
  lobby: null,
  loading: false,
  setLobbyCode: () => { },
  createLobby: () => { }
})