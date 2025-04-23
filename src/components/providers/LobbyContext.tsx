import { useState, useEffect } from "react"
import { LobbyContext } from "../../contexts"
import { Lobby as LobbyType, LobbyMember } from "../../types/types"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../../firebase/config"
import { createLobby, joinLobby } from "../../utils/lobbyUtils"

export const LobbyContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [lobbyId, setLobbyId] = useState("")
  const [loading, setLoading] = useState(false)
  const [lobby, setLobby] = useState<LobbyType | null>(null)
  // const [room, setRoom] = useState(null)

  const handleCreateLobby = async (host: LobbyMember) => {
    const lobbyId = await createLobby(host)
    setLobbyId(lobbyId)
  }

  const handleJoinLobby = async (
    lobbyCode: string,
    lobbyMember: LobbyMember
  ) => {
    // set the code, pass in also `LobbyMember` information to join the lobby.
    // Might need edge case checks like make sure the lobbyMember isn't part of the lobby.
    // add the lobbyMember to the lobby doc when joining.
    const lobbyId = await joinLobby(lobbyCode, lobbyMember)
    // pass the user infomation to create a lobby member.
    //
    setLobbyId(lobbyId)
  }

  useEffect(() => {
    if (lobbyId) {
      setLoading(true)
      const unsubscribe = onSnapshot(doc(db, "lobbies", lobbyId), (doc) => {
        // if it exists
        if (doc.exists()) {
          //
          setLobby(doc.data() as LobbyType)
        }
        setLoading(false)
      })
      return unsubscribe
    }
  }, [lobbyId])

  // useEffect(() => {
  //   // lobby?.room ?
  //   if (lobby?.roomId && lobbyId?.roomId !== null) {
  //     // unsubscribe them to the lobby

  //     //--
  //     // subscribe them to the room
  //     //----
  //     //---
  //     //--
  //     //-
  //     // what states can you game be in?
  //     // initial state
  //     // in lobby state
  //     // gameplay (room) state
  //     // win/lose state
  //     //-
  //     //---
  //     //-----
  //   }
  // }, [lobby])

  return (
    <LobbyContext.Provider
      value={{
        lobby,
        setLobbyCode: handleJoinLobby,
        loading,
        createLobby: handleCreateLobby,
      }}
    >
      {children}
    </LobbyContext.Provider>
  )
}
