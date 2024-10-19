import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";

import Chat from "./components/Chat";
import Pic from "./components/Chatpic"; // Import Pic component
import Doc from "./components/Chatdoc"; // Import Doc component

const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.error("Clerk frontend API key is missing!");
}

function App() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      navigate={(to) => navigate(to)}
    >
      <Routes>
        <Route
          path="/sign-in/*"
          element={<SignIn redirectUrl={"/"} routing="path" path="/sign-in" />}
        />
        <Route
          path="/sign-up/*"
          element={<SignUp redirectUrl={"/"} routing="path" path="/sign-up" />}
        />
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <Chat />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/chat"
          element={
            <>
              <SignedIn>
                <Chat />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/chat-pic"
          element={
            <>
              <SignedIn>
                <Pic />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/chat-doc"
          element={
            <>
              <SignedIn>
                <Doc />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </ClerkProvider>
  );
}

export default App;
