import { useContext, useState } from "react";
import { Alert } from "react-native";

import LoadingOverlay from "../components/ui/LoadingOverlay";
import AuthContent from "../components/Auth/AuthContent";
import { login } from "../util/auth";
import { AuthContext } from "../store/auth-context";

function LoginScreen() {
  /**Initially that is false, because when the screen first loads,
  we are not authenticating yet.*/
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authCtx = useContext(AuthContext);

  /**But once this function is executed, as a first step, we can set
  isAuthenticating to true, and once we're done creating the user, we 
  can set isAuthenticating to false.With this I wanna manage some loading
  state.*/
  async function loginHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const token = await login(email, password);
      authCtx.authenticate(token);
    } catch (error) {
      Alert.alert(
        "Authentication failed",
        "Could not log you in. Please check your credentials or try again later!"
      );
      /**If we put the code below outside the try and catch block, we are getting
      a warning because here, I'm setting isAuthenticating to false here to exit the
      loading state.But when make it outside it means I do this at the same time where 
      this screen is removed from the screen or stack because we changed the navigation
      screens or stacks and therefore a state update is performed for a component that's 
      not rendered anymore, which React doesn't like.So the solution is to only set 
      isAuthenticating to false in the error i.e in the catch block where we handle 
      error case where we don't leave the screen since when an error occurs we keep stuck 
      on the screen.And that should get rid of the error.*/
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay message="logging you in..." />;
  }

  return <AuthContent isLogin onAuthenticate={loginHandler} />;
}

export default LoginScreen;
