// import { Auth } from "firebase/auth"
// import React from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../../firebase/config"
import { Lobby, LobbyMember } from "../../types/types"
import { handleLeaveLobby, handleStartGame } from "../../utils/lobbyUtils"
import { useState } from "react"

function WaitingRoom({
  // auth,
  currentLobby,
  // handleLeaveLobby,
  // handleStartGame,
  errorMessage,
}: {
  // auth: Auth // Firebase auth object
  // currentLobby: any // Current lobby object
  currentLobby: Lobby // Current lobby object

  // handleLeaveLobby: () => void // Function to leave the lobby
  // handleStartGame: () => void // Function to start the game
  errorMessage?: string | null // Optional error message to display
}) {
  const navigate = useNavigate() // Add this hook

  const isHost = auth.currentUser?.uid === currentLobby.hostId
  // const [error, setError] = useState<string | null>(initialErrorMessage || null);  // Add state for errors
  const [error, setError] = useState<string | null>(errorMessage || null) // Add state for errors

  // Create wrapper functions
  const handleStartGameClick = () => {
    console.log("handleStartGameClick clicked: Starting game with lobby:", currentLobby)
    handleStartGame({
      currentLobby,
      setErrorMessage: setError,
      navigate,
    })
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Display lobby code */}
      <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Share this lobby code with friends:
        </p>
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
          {currentLobby.name}
        </h2>
      </div>

      {/* Display error if present */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Members list */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Members
        </h3>
        <ul className="space-y-2">
          {currentLobby.members.map((member: LobbyMember) => (
            <li
              key={member.id}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <span className="text-gray-800 dark:text-white">
                {member.displayName}
                {member.isHost && (
                  <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 rounded-full">
                    Host
                  </span>
                )}
              </span>
              {member.id === auth.currentUser?.uid && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  (You)
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Host controls */}
      <div className="flex flex-col space-y-3">
        {isHost && (
          <button
            onClick={handleStartGameClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Start Game
          </button>
        )}

        <button
          onClick={handleLeaveLobby}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          {isHost ? "Close Lobby" : "Leave Lobby"}
        </button>
      </div>
    </div>
  )
}

export default WaitingRoom
