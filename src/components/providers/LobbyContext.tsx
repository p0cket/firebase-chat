import { useState, useEffect } from "react";
import { LobbyContext } from "../../contexts";
import { Lobby as LobbyType, LobbyMember } from "../../types/types";
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../../firebase/config";
import { createLobby, joinLobby } from "../../utils/lobbyUtils";

export const LobbyContextProvider = ({children}: { children: React.ReactNode }) => {
  const [lobbyId, setLobbyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [lobby, setLobby] = useState<LobbyType | null>(null);

  const handleCreateLobby = async (host: LobbyMember) => {
    const lobbyId = await createLobby(host);
    setLobbyId(lobbyId);
  }

  const handleJoinLobby = async (lobbyCode: string) => {
    const lobbyId = await joinLobby(lobbyCode);
    setLobbyId(lobbyId);
  }

  useEffect(() => {
    if (lobbyId) {
      setLoading(true);
      const unsubscribe = onSnapshot(doc(db, "lobbies", lobbyId), (doc) => {
        if (doc.exists()) {
          setLobby(doc.data() as LobbyType);
        }
        setLoading(false);
      })
      return unsubscribe;
    }
  }, [lobbyId]);
  
  return (
    <LobbyContext.Provider value={{lobby, setLobbyCode: handleJoinLobby, loading, createLobby: handleCreateLobby }}>
      {children}
    </LobbyContext.Provider>
  )
}