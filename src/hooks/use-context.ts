import { useContext } from "react"
import { UserContext, LobbyContext } from '../contexts'

export const useUser = () => useContext(UserContext)
export const useLobby = () => useContext(LobbyContext)