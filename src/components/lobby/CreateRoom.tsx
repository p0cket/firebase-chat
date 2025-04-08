import { useState } from "react"
import { useLobby, useUser } from "../../hooks/use-context"
// import { handleJoinLobby } from "../../utils/lobbyUtils"

function CreateRoom() {
  const [formLobbyCode, setFormLobbyCode] = useState("")
  // look at the custom hooks
  const { createLobby, setLobbyCode } = useLobby()
  const { user } = useUser()
  if (!user) return null

  const createMemberObj = (isHost:boolean = false) => {
    return {
      id: user.uid,
      displayName: user.displayName || "Anonymous",
      isHost,
    }
  }

  const handleCreateLobby = () => {
    createLobby(createMemberObj(true))
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">
        Game Lobby
      </h2>
      {/* Display error if present */}
      {/* {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )} */}
      {/* Join Lobby Form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Join a Lobby
        </h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={formLobbyCode}
            onChange={(e) => setFormLobbyCode(e.target.value.toUpperCase())}
            maxLength={4}
            placeholder="Enter 4-letter code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase"
          />
          <button
          // we need to pass in the lobby code and the member object
            onClick={() => setLobbyCode(formLobbyCode, createMemberObj())}
            // onClick={handleCreateLobby}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Join
          </button>
        </div>
      </div>

      {/* Create Lobby Button */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Create a Lobby
        </h3>
        <button
          onClick={handleCreateLobby}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Create New Lobby
        </button>
      </div>
    </div>
  )
}

export default CreateRoom
