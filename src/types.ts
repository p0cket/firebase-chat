export type ChatMessageType = {
  message: {
    id?: string
    text: string
    uid: string
    photoURL?: string
    displayName?: string // Add displayName to message interface
  }
}
