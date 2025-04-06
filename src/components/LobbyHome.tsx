import Loading from "./lobby/Loading"
import WaitingRoom from "./lobby/WaitingRoom"
import CreateRoom from "./lobby/CreateRoom"
import { useLobby } from "../hooks/use-context"

export const LobbyHome = () => {
  const { lobby, loading } = useLobby()
  if (loading) return <Loading />
  if (lobby) return <WaitingRoom currentLobby={lobby} />
  return (
    <CreateRoom />
  )
}
export default LobbyHome
  // // State management
  // const [lobbyCode, setLobbyCode] = useState("")
  // const [errorMessage, setErrorMessage] = useState("")
  // const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null)
  // const [isLoading, setIsLoading] = useState(false)

  // // Effect to check if user is already in a lobby when component mounts
  // useEffect(() => {
  //   if (!auth.currentUser) return

  //   // Check user's active lobbies
  //   const checkExistingLobby = async () => {
  //     setIsLoading(true)
  //     try {
  //       // Here you would check if the user is already in an active lobby
  //       // For simplicity, we'll just assume they're not in this example
  //     } catch (error) {
  //       console.error("Error checking existing lobbies:", error)
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }
  //   checkExistingLobby()
  // }, [])

  // // @TODO:
  // // We're now searching for a lobby that has a property of lobbyCode that matches the current lobbyId (change to lobbyCode)
  // // onSubmit is not in the useEffect, does a lookup to find the lobby the that is the UID of the lobby that is
  // // the one they're looking for, and thats what they're subscribing to.
  // // Subscribing means that you're grabbing a piece of state, and listening to changes.

  // // Set up a listener for the current lobby if it exists
  // useEffect(() => {
  //   if (!currentLobby?.id) return
  //   // Subscribe to real-time updates for the current lobby using our utility function
  //   const unsubscribe = subscribeToLobbyUpdates(
  //     db,
  //     currentLobby.id,
  //     setCurrentLobby
  //   )
  //   // Clean up subscription on unmount or when lobby changes
  //   return () => unsubscribe()
  // }, [currentLobby?.id])

  // // Conditionally render based on whether the user is in a lobby
  // if (isLoading) {
  //   return <Loading />
  // }
  // // If the user is in a lobby, show the waiting room
  // if (currentLobby) {
  //   return (
  //     <WaitingRoom currentLobby={currentLobby} errorMessage={errorMessage} />
  //   )
  // }
  // // If the user is not in a lobby, show the join/create options
  // return (
  //   <>
  //     <CreateRoom
  //       errorMessage={errorMessage}
  //       lobbyCode={lobbyCode}
  //       setLobbyCode={setLobbyCode}
  //     />
  //   </>
  // )
// }