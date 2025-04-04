import React from "react"
import { handleCreateLobby, handleJoinLobby } from "../../utils/lobbyUtils"

function CreateRoom({
  errorMessage,
  lobbyCode,
  setLobbyCode,
}: //  handleJoinLobby, handleCreateLobby
{
  errorMessage: string | null
  lobbyCode: string
  setLobbyCode: (code: string) => void
  // handleJoinLobby: () => void
  // handleCreateLobby: () => void
}) {
  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">
        Game Lobby
      </h2>

      {/* Display error if present */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Join Lobby Form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Join a Lobby
        </h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={lobbyCode}
            onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
            maxLength={4}
            placeholder="Enter 4-letter code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase"
          />
          <button
            onClick={handleJoinLobby}
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
