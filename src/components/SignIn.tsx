import React from "react"
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

function SignIn() {
  const auth = getAuth();
  
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <button className="sign-in" onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
}

export default SignIn;
