import AsyncStorage from "@react-native-async-storage/async-storage"; /**This third-party package
will allow us to save the token on our device storage depending of the platform. */

import { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";

export const AuthContext = createContext({
  token: "",
  isAuthenticated: false,
  authenticate: (token) => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState();

  /**A note about token expiration.The token we're managing in our context
  and which we're storing on our device could expire.To be precise, it will 
  depend on your backend, whether it expires or not.
  In Firebase' case, there indeed is a 1h timer on the token. Therefore, the 
  token can still used after 1h but if you're sending it to Firebase, to access 
  some protected resources, after that hour, it won't work anymore. Firebase 
  will deny access. Therefore, you might want to consider doing at least one 
  of two things in your app code:
  
  
  1. Automatically log the user out after 1h (to avoid that the user thinks he or she is logged in)
  It can be achieved with help of setTimeout(). You can set a timer which runs 
  in the background and logs the user out after 1h. Of course you should set 
  that timer to a correct duration. If you just got a new token, the duration 
  will be 1h. If you logged a user in because the token was stored on the device, 
  the remaining duration is likely less than 1 hour. You should then calculate 
  the remaining duration by subtracting the current time from the expiration 
  time determine when the token was first received. Therefore, this expiration 
  time should also be derived and stored, whenever a new token is received.
 
  2. Refresh the token and get a new auth token. 
  It can be achieved with help of a specific auth API endpoint provided by 
  Firebase - this endpoint: https://firebase.google.com/docs/reference/rest/auth#section-refresh-token
  Whenever you get an auth token (i.e., after logging in or creating a new user), you also get a refresh 
  token (see the official documentation for logging in and signing up. The refreshToken field in the 
  responses carries a token that can be sent to the refresh token API endpoint 
  (https://firebase.google.com/docs/reference/rest/auth#section-refresh-token) to get a new auth token. 
  For this to work, the refresh token should of course also be stored (in Context and on the device).

  You could set a timer to refresh the token periodically, or you refresh it whenever the auth token expired.
  If you have a backend where tokens don't expire, the above steps of course won't apply to you.

  Alternatively, many third-party services (like Firebase) offer official SDKs which handle token 
  management (and refreshing the token) for you.
  In this case I achieved this with help of setTimeout().*/
  useEffect(() => {
    const checkTokenExpiration = async () => {
      const token = await AsyncStorage.getItem("token");
      const tokenTime = await AsyncStorage.getItem("tokenTimestamp");

      if (token && tokenTime) {
        const currentTime = new Date().getTime();
        const tokenExpirationTime = parseInt(tokenTime, 10) + 60 * 60 * 1000; // 1 hour in milliseconds

        if (currentTime >= tokenExpirationTime) {
          // If 1h has passed, the token expired, therefore we need to log out the user
          logout();
          AsyncStorage.removeItem("tokenTimestamp");
          Alert.alert("Timeout! ", "Please log in before continuing.");
          console.log("User logged out automatically after 1 hour.");
        } else {
          // If the token has not expired yet, we derive the remaining time
          const timeRemaining = tokenExpirationTime - currentTime;
          setTimeout(checkTokenExpiration, timeRemaining);
        }
      }
    };

    // Call this function if the user is connected or when the component mounts
    checkTokenExpiration();

    // Set up a timer to periodically check for token expiration
    const tokenExpirationCheckInterval = setInterval(
      checkTokenExpiration,
      60 * 1000
    ); // Check every minute

    // Clean up the interval when the component unmounts or the user disconnects manually
    return () => clearInterval(tokenExpirationCheckInterval);
  }, [AsyncStorage]);

  /**Now, therefore here we might wanna store that 
  token on the device and not just in memory so that 
  you can load it when the app starts up again and 
  you can auto log in the user so to say if a token 
  was stored before.*/
  function authenticate(token) {
    //Check if the token timestamp is already stored
    AsyncStorage.getItem("tokenTimestamp")
      .then((timestamp) => {
        console.log(timestamp);
        if (!timestamp) {
          // If the token timestamp is not registered yet then we should store it in the
          const currentTime = new Date().getTime();
          AsyncStorage.setItem("tokenTimestamp", currentTime.toString());
        }
      })
      .catch((error) => {
        console.error("Error while checking/storing timestamp:", error);
      });

    setAuthToken(token);
    /**This will store a new item in the storage.Now, 
    when calling setItem, you need to give that item a 
    key, for example, token, which you can then later 
    use to retrieve or delete that item.The second 
    argument you pass to setItem is the item you wanna 
    store and that should always be a string.So if you 
    have a non-string value, like a number, you should
    convert it to a string first. An object could be 
    converted to JSON, which is a string.*/
    AsyncStorage.setItem("token", token);
  }

  function logout() {
    /**We clear the token by setting it to null.*/
    setAuthToken(null);
    AsyncStorage.removeItem("token");
  }

  const value = {
    token: authToken,
    isAuthenticated: !!authToken,
    authenticate: authenticate,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
