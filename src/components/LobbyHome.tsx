import { useState, useEffect } from "react"
import { auth, db } from "../firebase/config"
import {
  // collection,
  // doc,
  // setDoc,
  // getDoc,
  // updateDoc,
  // onSnapshot,
  // arrayUnion,
  // arrayRemove,
  // serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { subscribeToLobbyUpdates } from "../utils/lobbyUtils"
import Loading from "./lobby/Loading"
import WaitingRoom from "./lobby/WaitingRoom"
import CreateRoom from "./lobby/CreateRoom"

// Define types for our component
interface LobbyMember {
  id: string
  displayName: string
  isHost: boolean
}

interface Lobby {
  id: string
  name: string
  isActive: boolean
  hostId: string
  members: LobbyMember[]
  createdAt: Timestamp
  lobbyCode: string
}

export const LobbyHome = () => {
  // State management
  const [lobbyCode, setLobbyCode] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Effect to check if user is already in a lobby when component mounts
  useEffect(() => {
    if (!auth.currentUser) return

    // Check user's active lobbies
    const checkExistingLobby = async () => {
      setIsLoading(true)
      try {
        // Here you would check if the user is already in an active lobby
        // For simplicity, we'll just assume they're not in this example
      } catch (error) {
        console.error("Error checking existing lobbies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingLobby()
  }, [])

  // @TODO:
  // We're now searching for a lobby that has a property of lobbyCode that matches the current lobbyId (change to lobbyCode)

  // onSubmit is not in the useEffect, does a lookup to find the lobby the that is the UID of the lobby that is
  // the one they're looking for, and thats what they're subscribing to.
  // Subscribing means that you're grabbing a piece of state, and listening to changes.

  // Set up a listener for the current lobby if it exists
  useEffect(() => {
    if (!currentLobby?.id) return

    // Subscribe to real-time updates for the current lobby using our utility function
    const unsubscribe = subscribeToLobbyUpdates(
      db,
      currentLobby.id,
      setCurrentLobby
    )

    // Clean up subscription on unmount or when lobby changes
    return () => unsubscribe()
  }, [currentLobby?.id])

  // // Generate a random 4-letter lobby code
  // const generateLobbyCode = () => {
  //   const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  //   let result = ""
  //   for (let i = 0; i < 4; i++) {
  //     result += characters.charAt(Math.floor(Math.random() * characters.length))
  //   }
  //   return result
  // }

  // Create a new lobby
  // const handleCreateLobby = async () => {
  //   if (!auth.currentUser) {
  //     setErrorMessage("You must be logged in to create a lobby")
  //     return
  //   }

  //   setIsLoading(true)
  //   setErrorMessage("")

  //   try {
  //     // Generate a random code for the lobby
  //     const lobbyId = generateLobbyCode()

  //     // Create the host member object
  //     const hostMember: LobbyMember = {
  //       id: auth.currentUser.uid,
  //       displayName: auth.currentUser.displayName || "Anonymous Host",
  //       isHost: true,
  //     }

  //     // Create a new lobby document
  //     const newLobby: Omit<Lobby, "id"> = {
  //       name: `${hostMember.displayName}'s Lobby`,
  //       isActive: true,
  //       hostId: auth.currentUser.uid,
  //       members: [hostMember],
  //       createdAt: serverTimestamp(),
  //       lobbyCode: lobbyId,
  //     }

  //     // Have it create a random ID

  //     // Add the lobby to Firestore
  //     // await setDoc(doc(db, "lobbies", lobbyId), newLobby)
  //     await setDoc(doc(db, "lobbies"), newLobby)

  //     // Update local state with the new lobby
  //     setCurrentLobby({ id: lobbyId, ...newLobby })
  //   } catch (error) {
  //     console.error("Error creating lobby:", error)
  //     setErrorMessage("Failed to create lobby. Please try again.")
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  // Join an existing lobby
  // const handleJoinLobby = async () => {
  //   if (!auth.currentUser) {
  //     setErrorMessage("You must be logged in to join a lobby")
  //     return
  //   }

  //   if (!lobbyCode.trim()) {
  //     setErrorMessage("Please enter a lobby code")
  //     return
  //   }

  //   setIsLoading(true)
  //   setErrorMessage("")

  //   try {
  //     // Check if the lobby exists
  //     const lobbyRef = doc(db, "lobbies", lobbyCode.toUpperCase().trim())
  //     const lobbyDoc = await getDoc(lobbyRef)

  //     if (!lobbyDoc.exists()) {
  //       setErrorMessage("Lobby not found. Please check the code and try again.")
  //       setIsLoading(false)
  //       return
  //     }

  //     const lobbyData = lobbyDoc.data() as Omit<Lobby, "id">

  //     // Check if the lobby is active
  //     if (!lobbyData.isActive) {
  //       setErrorMessage("This lobby is no longer active.")
  //       setIsLoading(false)
  //       return
  //     }

  //     // Check if the user is already a member
  //     const isMember = lobbyData.members.some(
  //       (member) => member.id === auth.currentUser?.uid
  //     )

  //     if (!isMember) {
  //       // Create a member object for the current user
  //       const newMember: LobbyMember = {
  //         id: auth.currentUser.uid,
  //         displayName: auth.currentUser.displayName || "Anonymous User",
  //         isHost: false,
  //       }

  //       // Add the user to the lobby members
  //       await updateDoc(lobbyRef, {
  //         members: arrayUnion(newMember),
  //       })
  //     }

  //     // Set the current lobby in state
  //     setCurrentLobby({ id: lobbyDoc.id, ...lobbyData })
  //   } catch (error) {
  //     console.error("Error joining lobby:", error)
  //     setErrorMessage("Failed to join lobby. Please try again.")
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  // // Leave the current lobby
  // const handleLeaveLobby = async () => {
  //   if (!auth.currentUser || !currentLobby) return

  //   setIsLoading(true)
  //   try {
  //     const lobbyRef = doc(db, "lobbies", currentLobby.id)
  //     const isHost = currentLobby.hostId === auth.currentUser.uid

  //     if (isHost) {
  //       // If the host leaves, mark the lobby as inactive
  //       await updateDoc(lobbyRef, {
  //         isActive: false,
  //       })
  //     } else {
  //       // If a regular member leaves, remove them from the members array
  //       await updateDoc(lobbyRef, {
  //         members: arrayRemove(
  //           currentLobby.members.find((m) => m.id === auth.currentUser?.uid)
  //         ),
  //       })
  //     }

  //     // Reset local state
  //     setCurrentLobby(null)
  //   } catch (error) {
  //     console.error("Error leaving lobby:", error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  // // Start the game (host only)
  // const handleStartGame = () => {
  //   if (!auth.currentUser || !currentLobby) return

  //   // Verify the current user is the host
  //   if (currentLobby.hostId !== auth.currentUser.uid) {
  //     setErrorMessage("Only the host can start the game")
  //     return
  //   }

  //   console.log("Game started with lobby:", currentLobby.id)
  //   // Here you would typically:
  //   // 1. Update the lobby status in Firestore
  //   // 2. Redirect players to the game component
  //   // 3. Initialize game state
  // }

  // Conditionally render based on whether the user is in a lobby
  if (isLoading) {
    // return (
    //   <div className="flex justify-center items-center h-full">
    //     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    //   </div>
    // )
    ;<Loading />
  }

  // If the user is in a lobby, show the waiting room
  if (currentLobby) {
    // const isHost = auth.currentUser?.uid === currentLobby.hostId
    ;<WaitingRoom
      // auth={auth}
      currentLobby={currentLobby}
      // handleLeaveLobby
      // handleStartGame
      errorMessage={errorMessage}
    />
    // return (
    //   <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    //     <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
    //       Lobby: {currentLobby.name}
    //     </h2>

    //     {/* Display lobby code */}
    //     <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
    //       <p className="text-sm text-gray-500 dark:text-gray-400">
    //         Share this code with friends:
    //       </p>
    //       <p className="text-3xl font-bold tracking-wider text-center text-gray-800 dark:text-white">
    //         {currentLobby.id}
    //       </p>
    //     </div>

    //     {/* Display error if present */}
    //     {errorMessage && (
    //       <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
    //         {errorMessage}
    //       </div>
    //     )}

    //     {/* Members list */}
    //     <div className="mb-6">
    //       <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
    //         Members
    //       </h3>
    //       <ul className="space-y-2">
    //         {currentLobby.members.map((member) => (
    //           <li
    //             key={member.id}
    //             className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
    //           >
    //             <span className="text-gray-800 dark:text-white">
    //               {member.displayName}
    //               {member.isHost && (
    //                 <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 rounded-full">
    //                   Host
    //                 </span>
    //               )}
    //             </span>
    //             {member.id === auth.currentUser?.uid && (
    //               <span className="text-xs text-gray-500 dark:text-gray-400">
    //                 (You)
    //               </span>
    //             )}
    //           </li>
    //         ))}
    //       </ul>
    //     </div>

    //     {/* Host controls */}
    //     <div className="flex flex-col space-y-3">
    //       {isHost && (
    //         <button
    //           onClick={handleStartGame}
    //           className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
    //         >
    //           Start Game
    //         </button>
    //       )}

    //       <button
    //         onClick={handleLeaveLobby}
    //         className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
    //       >
    //         {isHost ? "Close Lobby" : "Leave Lobby"}
    //       </button>
    //     </div>
    //   </div>
    // )
  }

  // If the user is not in a lobby, show the join/create options
  return (
    //   <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    //     <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">
    //       Game Lobby
    //     </h2>

    //     {/* Display error if present */}
    //     {errorMessage && (
    //       <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
    //         {errorMessage}
    //       </div>
    //     )}

    //     {/* Join Lobby Form */}
    //     <div className="mb-6">
    //       <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
    //         Join a Lobby
    //       </h3>
    //       <div className="flex space-x-2">
    //         <input
    //           type="text"
    //           value={lobbyCode}
    //           onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
    //           maxLength={4}
    //           placeholder="Enter 4-letter code"
    //           className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase"
    //         />
    //         <button
    //           onClick={handleJoinLobby}
    //           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
    //         >
    //           Join
    //         </button>
    //       </div>
    //     </div>

    //     {/* Create Lobby Button */}
    //     <div>
    //       <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
    //         Create a Lobby
    //       </h3>
    //       <button
    //         onClick={handleCreateLobby}
    //         className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
    //       >
    //         Create New Lobby
    //       </button>
    //     </div>
    //   </div>
    <CreateRoom
      errorMessage={errorMessage}
      lobbyCode={lobbyCode}
      setLobbyCode={setLobbyCode}
      // handleJoinLobby={handleJoinLobby}
      // handleCreateLobby={handleCreateLobby}
    />
  )
}

export default LobbyHome
