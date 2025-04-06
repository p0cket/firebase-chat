// Importing the singleton instance of Firebase Auth from your configuration
import {
//   collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore"
import { auth, db } from "../firebase/config"
import { Lobby, LobbyMember } from "../types/types"

/**
 * Subscribes to real-time updates for a specified lobby.
 *
 * @param lobbyId ID of the lobby to subscribe to.
 * @param setCurrentLobby State setter function for the current lobby.
 * @returns Unsubscribe function to stop listening to updates.
 */
export const subscribeToLobbyUpdates = (
  lobbyId: string,
  setCurrentLobby: (lobby: Lobby | null) => void
) => {
  const unsubscribe = onSnapshot(
    doc(db, "lobbies", lobbyId),
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const lobbyData = docSnapshot.data() as Omit<Lobby, "id">
        setCurrentLobby({ id: docSnapshot.id, ...lobbyData })
      } else {
        // Lobby was deleted
        setCurrentLobby(null)
      }
    },
    (error) => {
      console.error("Error listening to lobby updates:", error)
    }
  )
  return unsubscribe
}

/**
 * Creates a new lobby using the singleton auth instance.
 *
 * @param setErrorMessage Function to set error message.
 * @param setIsLoading Function to set loading state.
 * @param setCurrentLobby Function to set the current lobby in state.
 */
export const handleCreateLobby = async ({
  setErrorMessage,
  setIsLoading,
  setCurrentLobby,
}: {
  setErrorMessage: (message: string) => void
  setIsLoading: (isLoading: boolean) => void
  setCurrentLobby: (lobby: Lobby | null) => void
 
}) => {
  // Check if user is authenticated using the singleton instance
  if (!auth.currentUser) {
    setErrorMessage("You must be logged in to create a lobby")
    return
  }

  setIsLoading(true)
  setErrorMessage("")

  try {
    // Generate a random lobby code (e.g., "ABCD")
    const lobbyId = generateLobbyCode()

    // Create the host member object with current user's details
    const hostMember: LobbyMember = {
      id: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || "Anonymous Host",
      isHost: true,
    }

    // Create a new lobby object with initial details
    const newLobby: Omit<Lobby, "id"> = {
      name: `${hostMember.displayName}'s Lobby`,
      isActive: true,
      hostId: auth.currentUser.uid,
      members: [hostMember],
      createdAt: serverTimestamp(),
      lobbyCode: lobbyId,
    }

    // Add the lobby to Firestore with the generated lobbyId as document ID
    await setDoc(doc(db, "lobbies", lobbyId), newLobby)

    // Update local state with the new lobby data
    setCurrentLobby({ id: lobbyId, ...newLobby })
  } catch (error) {
    console.error("Error creating lobby:", error)
    setErrorMessage("Failed to create lobby. Please try again.")
  } finally {
    setIsLoading(false)
  }
}

/**
 * Joins an existing lobby using the singleton auth instance.
 *
 * @param setErrorMessage Function to set error message.
 * @param lobbyCode The lobby code to join.
 * @param setIsLoading Function to set loading state.
 * @param setCurrentLobby Function to set the current lobby in state.
 */
export const handleJoinLobby = async ({
  setErrorMessage,
  lobbyCode,
  setIsLoading,
  setCurrentLobby,
}: {
  setErrorMessage: (message: string) => void
  lobbyCode: string
  setIsLoading: (isLoading: boolean) => void
  setCurrentLobby: (lobby: Lobby | null) => void
}) => {
  // Ensure the user is signed in
  if (!auth.currentUser) {
    setErrorMessage("You must be logged in to join a lobby")
    return
  }

  if (!lobbyCode.trim()) {
    setErrorMessage("Please enter a lobby code")
    return
  }

  setIsLoading(true)
  setErrorMessage("")

  try {
    // Convert lobby code to uppercase and trim whitespace for consistency
    const lobbyRef = doc(db, "lobbies", lobbyCode.toUpperCase().trim())
    const lobbyDoc = await getDoc(lobbyRef)

    if (!lobbyDoc.exists()) {
      setErrorMessage("Lobby not found. Please check the code and try again.")
      setIsLoading(false)
      return
    }

    const lobbyData = lobbyDoc.data() as Omit<Lobby, "id">

    // Check if the lobby is still active
    if (!lobbyData.isActive) {
      setErrorMessage("This lobby is no longer active.")
      setIsLoading(false)
      return
    }

    // Check if the user is already a member of the lobby
    const isMember = lobbyData.members.some(
      (member) => member.id === auth.currentUser?.uid
    )

    if (!isMember) {
      // Create a member object for the current user
      const newMember: LobbyMember = {
        id: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || "Anonymous User",
        isHost: false,
      }

      // Add the user to the lobby's members array
      await updateDoc(lobbyRef, {
        members: arrayUnion(newMember),
      })
    }

    // Update local state with the lobby data
    setCurrentLobby({ id: lobbyDoc.id, ...lobbyData })
  } catch (error) {
    console.error("Error joining lobby:", error)
    setErrorMessage("Failed to join lobby. Please try again.")
  } finally {
    setIsLoading(false)
  }
}

/**
 * Leaves the current lobby using the singleton auth instance.
 *
 * @param currentLobby The current lobby the user is in.
 * @param setIsLoading Function to set loading state.
 * @param setCurrentLobby Function to reset the current lobby in state.
 */
export const handleLeaveLobby = async ({
  currentLobby,
  setIsLoading,
  setCurrentLobby,
}: {
  currentLobby: Lobby | null
  setIsLoading: (isLoading: boolean) => void
  setCurrentLobby: (lobby: Lobby | null) => void
}) => {
  // Ensure there is an authenticated user and a current lobby
  if (!auth.currentUser || !currentLobby) return

  setIsLoading(true)
  try {
    const lobbyRef = doc(db, "lobbies", currentLobby.id)
    const isHost = currentLobby.hostId === auth.currentUser.uid

    if (isHost) {
      // If the host leaves, mark the lobby as inactive
      await updateDoc(lobbyRef, {
        isActive: false,
      })
    } else {
      // If a regular member leaves, remove them from the lobby's members array
      await updateDoc(lobbyRef, {
        members: arrayRemove(
          currentLobby.members.find((m) => m.id === auth.currentUser?.uid)
        ),
      })
    }

    // Reset local lobby state
    setCurrentLobby(null)
  } catch (error) {
    console.error("Error leaving lobby:", error)
  } finally {
    setIsLoading(false)
  }
}

/**
 * Starts the game (host only) using the singleton auth instance.
 *
 * @param currentLobby The current lobby the user is in.
 * @param setErrorMessage Function to set error message.
 */
export const handleStartGame = ({
  currentLobby,
  setErrorMessage,
}: {
  currentLobby: Lobby | null
  setErrorMessage: (message: string) => void
}) => {
  // Ensure there is an authenticated user and a current lobby
  if (!auth.currentUser || !currentLobby) return

  // Verify the current user is the host
  if (currentLobby.hostId !== auth.currentUser.uid) {
    setErrorMessage("Only the host can start the game")
    return
  }

  console.log("Game started with lobby:", currentLobby.id)
  // Here you would typically:
  // 1. Update the lobby status in Firestore
  // 2. Redirect players to the game component (using react-router, for example)
  // 3. Initialize game state (possibly using React state management or context)
}

/**
 * Generates a random 4-letter lobby code.
 *
 * @returns A random string consisting of 4 uppercase letters.
 */
export const generateLobbyCode = () => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  let result = ""
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export const createLobby = async (host: LobbyMember) => {
  const lobbyCode = generateLobbyCode();
  const newLobby: Omit<Lobby, 'id'> = {
    lobbyCode: lobbyCode,
    name: lobbyCode,
    hostId: host.id,
    members: [host],
    isActive: true,
    createdAt: Timestamp.now(),
  }

  const docSnap = await addDoc(collection(db, "lobbies"), newLobby);

  return docSnap.id
}

export const joinLobby = async (lobbyCode: string) => {
  const lobbiesRef = collection(db, "lobbies");
  const q = query(lobbiesRef, where("lobbyCode", "==", lobbyCode));
  const querySnap = await getDocs(q);
  return querySnap.docs[0]?.id;
}

