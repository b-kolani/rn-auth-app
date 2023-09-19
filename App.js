import { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppLoading from "expo-app-loading";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import { Colors } from "./constants/styles";
import AuthContextProvider, { AuthContext } from "./store/auth-context";
import IconButton from "./components/ui/IconButton";

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: "white",
        contentStyle: { backgroundColor: Colors.primary100 },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  const authCtx = useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: "white",
        contentStyle: { backgroundColor: Colors.primary100 },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          headerRight: ({ tintColor }) => (
            <IconButton
              icon="exit"
              color={tintColor}
              size={24}
              onPress={authCtx.logout}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}

function Navigation() {
  const authCtx = useContext(AuthContext);

  return (
    <NavigationContainer>
      {/**Here we simply swapped stack of screens based on certain condition.*/}
      {!authCtx.isAuthenticated && <AuthStack />}
      {authCtx.isAuthenticated && <AuthenticatedStack />}
    </NavigationContainer>
  );
}

/**Now since, in the App component the context is 
      provided, we can't tap into our context if we keep our useEffect in the 
      App component though, and therefore, a workaround here could be to add 
      another component in our case named Root, where we actually put our 
      useEffect. And this component we then actually return our navigation.
      And in the App component it is the Root component we render between 
      AuthContextProvider and therefore, in the Root component, we can uses 
      our AuthContext or to tap into our AuthContext.The advantage of this 
      approach is now that we can uses the AppLoading component, to prolong 
      the loading screen until we're done fetching the token.To do this, we 
      need to install another package.*/
function Root() {
  /**THis initially was true because we are trying to log the user in. */
  const [isTryingLogin, setIsTryingLogin] = useState(true);
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    async function fetchToken() {
      const storedToken = await AsyncStorage.getItem("token");

      /**So we only auto log in the user if we did find a storedToken here.
      We check if storedToken is truthy and if we find one, we setAutToken to 
      our storedToken. Now, what you will notice, of course, is that briefly, 
      we saw the login screen because that was actually the first screen loaded
      before fetching the token finished. Now to avoid this flickering, to get 
      rid of that, what we can do is prolong the loading screen of our app, the
      splash screen until we tried to fetch a token.To achieve this, we can cut 
      useEffect and remove it from AuthContextProvider and instead add it here 
      in App.js in the App component. And then here, in the App component, we,
      of course, can't call setAuthToken here like this, but instead, we wanna
      update our context here.   
      */
      if (storedToken) {
        //setAuthToken(storedToken);
        authCtx.authenticate(storedToken);
      }

      /**But then here once we're done fetching the token, no matter if we did find 
      the token or not, either way, we are done trying to log in, so we can set this 
      to false then because we are no longer trying to log the user in.*/
      setIsTryingLogin(false);
    }

    fetchToken();
  }, []);

  if (isTryingLogin) {
    return <AppLoading />;
  }

  return <Navigation />;
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AuthContextProvider>
        <Root/>
      </AuthContextProvider>
    </>
  );
}
