import axios from "axios";
import { useContext, useEffect, useState } from "react";

import { StyleSheet, Text, View } from "react-native";
import { AuthContext } from "../store/auth-context";

function WelcomeScreen() {
  const [fetchedMessage, setFetchedMessage] = useState("");

  const authCtx = useContext(AuthContext);
  const token = authCtx.token;

  /**We could use async await and wrap this into a extra
    function i.e put axios in an async function, because this 
    function, this effect function should not be turned into 
    an async function or we use promises in the good old way
    by adding then and then get our response in this function
    which we pass to the then block*/
  /**At the moment we can send this get request and get this 
    data just like that because the firebase Database API, is 
    not protected.In our Database API we have some rules which 
    grant us access to the database or to the API to be precise.
    And if you would be building your own API, you also might 
    have URLs that are accessible to everyone.But you also might 
    wanna have certain routes, certain endpoints that are only 
    accessible by authenticated users.Now, we do log our users in
    but at the moment there on the backend, there is no connection
    between a user being authenticated and our data in the DAtabase 
    API.Because backend APIs like the Firebase one are stateless, 
    Firebase doesn't store the information that a user did log in. 
    That's why we are getting a token.We can use this token to grant 
    access or to get access to protected endpoints.For that we need 
    to protect endpoints.And on Firebase, we can do this by changing 
    rules the read an write ones on our realtime database rules in 
    our Firebase Database API.For example to read a resource the rule 
    will be ".read": "auth.uid != null", this means that now read 
    requests are only allowed if we do have a valid user ID, so if 
    a user is authenticated, if the incoming request can prove that a 
    user is authenticated.And that uid will be part of the token provided
    by the Firebase backend, which we get.We can use the same with write 
    and also lock this down like this ".write": "auth.uid != null".So if
    we now publish those rules by clicking on the publish button in our 
    Firebase backend API, we won't be able to fetch our data without
    proving that we are authenticated. And we can solve or prove that we 
    are authenticated because if we attach the token to this outgoing 
    request get one below, we can prove to Firebase that we rae authenticated.
    Firebase will then have a look at the token, validate the token, and extract 
    information like the user ID from the token and then grant us access if the 
    token is valid.If it's not, we don't get access.And how can this be achieve?
    How can we add the token here? Well, in Firebase case, we simply have to add 
    the auth query parameter here in our get request to the URL. For other APIs, 
    it might be different.You might need to add a header but here we just add the 
    auth query parameter and set it equal to our token.*/

  useEffect(() => {
    axios
      .get(
        "https://react-native-course-b1a83-default-rtdb.firebaseio.com/message.json?auth=" +
          token
      )
      .then((response) => {
        //console.log(response.data);
        setFetchedMessage(response.data);
      });
  }, [token]);

  /**The token is not just used in our app, to find out
  whether a user did log in or not, It is important 
  for that as well, but it's not just that. Instead , it's also 
  used on a API to find out if a request is coming from an
  authenticated user or not because typically, REST APIs don't 
  store that information.They don't know if any random app's user 
  is authenticated or not.Instead, you have to send the information 
  that you are authenticated, that token along with the request that 
  is targeting a protected resource. LIke our Firebase API, which is 
  protected because of these rules we implemented.The token is your
  ticket to get access and that's why we are managing it on the front 
  end and why we don't just use it to find out whether a user is 
  authenticated.*/

  return (
    <View style={styles.rootContainer}>
      <Text style={styles.title}>Welcome!</Text>
      <Text>You authenticated successfully!</Text>
      {/**The fetched message loads a little bit after the rest of
      this page because it has to be fetched first. */}
      <Text>{fetchedMessage}</Text>
    </View>
  );
}

export default WelcomeScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
