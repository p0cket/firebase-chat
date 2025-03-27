import React from 'react'
import { getAuth, signOut } from "firebase/auth";

function SignOut() {
  const auth = getAuth();
  
  return auth.currentUser && (
    <button className="sign-out" onClick={() => signOut(auth)}>
      Sign Out
    </button>
  );
}

export default SignOut;