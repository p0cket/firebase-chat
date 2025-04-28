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
import { NavigateFunction, useNavigate } from "react-router-dom"
// import { useNavigate } from "react-router-dom"

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

// Make a CreateRoom function, that creates a new room in Firestore.
/**
 * Creates a new room in Firestore and associates it with a lobby.
 *
 * @param lobbyId The ID of the lobby to associate with the room.
 * param gameSettings Optional game settings for the room.
 * @returns The ID of the newly created room.
 */
export const createRoom = async (
  lobbyId: string
  // gameSettings: Record<string, any> = {}
) => {
  console.log("Creating room for lobby:", lobbyId)
  try {
    // Get the current lobby data
    const lobbyRef = doc(db, "lobbies", lobbyId)
    const lobbySnap = await getDoc(lobbyRef)
    if (!lobbySnap.exists()) {
      throw new Error("Lobby not found")
    }
    const lobbyData = lobbySnap.data() as Lobby

    // Create a new room document
    const roomData = {
      lobbyId: lobbyId,
      hostId: lobbyData.hostId,
      members: lobbyData.members,
      createdAt: serverTimestamp(),
      status: "waiting", // Possible values: waiting, active, completed
      // gameSettings,
      messages: [],
      // Add any other room-specific fields here
    }

    // Add the room to Firestore
    const roomRef = await addDoc(collection(db, "rooms"), roomData)

    // Update the lobby with the room ID
    await updateDoc(lobbyRef, {
      roomId: roomRef.id,
    })

    return roomRef.id
  } catch (error) {
    console.error("Error creating room:", error)
    throw error
  }
}

// Make the updateLobbyWithRoomId function, which updates the lobby with the room ID.
/**
 * Updates the lobby with the newly created room ID.
 *
 * @param lobbyId The ID of the lobby to update.
 * @param roomId The ID of the room to associate with the lobby.
 */
export const updateLobbyWithRoomId = async (
  lobbyId: string,
  roomId: string
) => {
  console.log("Updating lobby with room ID:", lobbyId, roomId)
  try {
    const lobbyRef = doc(db, "lobbies", lobbyId)

    // Update the lobby with the new room ID
    await updateDoc(lobbyRef, {
      roomId: roomId,
    })

    console.log("Lobby updated with new room ID:", roomId)
  } catch (error) {
    console.error("Error updating lobby with room ID:", error)
    throw error
  }
}

/**
 * Starts the game (host only) using the singleton auth instance.
 *
 * @param currentLobby The current lobby the user is in.
 * @param setErrorMessage Function to set error message.
 * @param navigate Function to navigate to another route.
 */
export const handleStartGame = ({
  currentLobby,
  setErrorMessage,
  navigate,
}: {
  currentLobby: Lobby | null
  setErrorMessage: (message: string) => void
  navigate: (path: string) => void
}) => {
  console.log("handleStartGame: Starting game for lobby:", currentLobby)
  // Ensure there is an authenticated user and a current lobby
  if (!auth.currentUser || !currentLobby) return

  // Verify the current user is the host
  if (currentLobby.hostId !== auth.currentUser.uid) {
    setErrorMessage("Only the host can start the game")
    return
  }

  console.log("Game started with lobby:", currentLobby.id)
  // Here you would typically:
  // 1. Update the lobby status in Firestore, by:
  // a) creating a new room obj, and
  createRoom(currentLobby.id)
    .then((roomId) => {
      // b) setting the lobby's roomId to the room obj's Unique Id
      // Update the lobby with the new room ID
      updateLobbyWithRoomId(currentLobby.id, roomId)
      // Optionally, redirect to the game component or update state
      console.log("Game started successfully, room ID:", roomId)
      // 2. Redirect players to the game component (using react-router, for example)
      // Do this by navigating to the game route, which is the room's unique ID.
      // Navigate to the game room page using the room ID
      navigate(`/room/${roomId}`)
    })
    .catch((error) => {
      console.error("Error starting game:", error)
    })

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

export const createLobby = async (
  host: LobbyMember,
  // navigate: (path: string) => void
  navigate: NavigateFunction
) => {
  const lobbyCode = generateLobbyCode()
  const newLobby: Omit<Lobby, "id"> = {
    lobbyCode: lobbyCode,
    name: lobbyCode,
    hostId: host.id,
    members: [host],
    isActive: true,
    createdAt: Timestamp.now(),
    roomId: null,
  }

  const docSnap = await addDoc(collection(db, "lobbies"), newLobby)

  navigate(`/lobbies/${lobbyCode}`)

  return docSnap.id
}

export const joinLobby = async (
  lobbyCode: string,
  lobbyMember: LobbyMember
) => {
  const lobbiesRef = collection(db, "lobbies")
  // && where the userId is not in the members array
  const q = query(lobbiesRef, where("lobbyCode", "==", lobbyCode))
  const querySnap = await getDocs(q)

  // Check if we found any matching lobbies
  if (querySnap.empty) {
    throw new Error(`No lobby found with code ${lobbyCode}`)
  }

  const lobbyId = querySnap.docs[0].id
  await haveMemberJoinLobby(lobbyId, lobbyMember)
  return lobbyId
}

export const haveMemberJoinLobby = async (
  lobbyUID: string,
  // memberUid: string
  lobbyMember: LobbyMember
) => {
  try {
    // First, verify the lobby exists and get current members
    const lobbyRef = doc(db, "lobbies", lobbyUID)
    const lobbySnap = await getDoc(lobbyRef)

    if (!lobbySnap.exists()) {
      throw new Error("Lobby not found")
    }
    // const lobbyData: Lobby = lobbySnap.data() //declaration. Preferable where you could.
    const lobbyData = lobbySnap.data() as Lobby //assertion. When pulling data from third parties, when you can't declare you assert
    const currentMembers: LobbyMember[] = lobbyData.members || []
    // const currentMembers = lobbyData.members || []

    console.log("Current members:", currentMembers)
    console.log("New member:", lobbyMember)
    // Check if the user is already a member of the lobby
    if (currentMembers.some((m) => m.id === lobbyMember.id)) {
      console.log("User already in lobby")
      return // Already a member, nothing to do
    }

    // If not, add the new member to the existing members array
    const updatedMembers = [...currentMembers, lobbyMember]

    // Update the lobby with the new members array
    await updateDoc(lobbyRef, {
      members: updatedMembers,
    })
  } catch (error) {
    console.error("Error joining lobby:", error)
    throw error
  }
}

// StartGame
// -- only host can click that button
// Create a room in firestore in firestore room collection
// (you need all the relevant data into the lobby)
// Copy the lobby members to the new lobby. Also relevant data
//
// Everyone is listening to the lobby document
// host is triggering the document to change
// A change of status in the lobby document, and what the room is
// room = null if theres a roomId, move into the room
//
// in a useEffect, listen for a change and in the document,
//
