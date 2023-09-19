import axios from "axios";

/**The key at the end is a part of the url.It is the api key 
you can find in your firebase project. */
const API_KEY = "AIzaSyBYKRxh3vD0OoMoH6cQ8hvWzQhcRw55Vtk";

/**Now, because we have similarities with sign up and sign in 
I will add this function below that takes parameters which are
mode that is a string either signup or sign-in because that is 
the only difference between these two requests to say these two 
endpoints or URLs of the two requests, and other two 
parameters which are similar for these two requests if we get a look 
on the firebase rest api docs. And by accepting mode as a parameter,
we can construct the URL dynamically, and use one function for sending
a request, to two different URLs.The two requests used the same http method
which is the POST method.It is only a segment in their different endpoints 
or URLs which can be found in the firebase rest api docs.So the request body
is the same for both URLs.So for signing up and signing in.Therefore below
we have one shared function for signup and sign in, that has the main logic
in it.*/
async function authenticate(mode, email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${API_KEY}`;

  const response = await axios.post(url, {
    email: email,
    password: password,
    returnSecureToken: true /**In the context of Firebase Authentication 
    (a popular identity and authentication service), the "returnSecureToken" parameter typically refers to a request or configuration option.
    When you include "returnSecureToken" 
    as a parameter in certain API requests, it indicates that you want to receive a secure token as part of the response.  */,
  });

  //console.log(response.data);
  /**We extract the token from the parsed data in the response */
  const token = response.data.idToken;

  return token;
}

/**The first argument passed to the post method is the url that we
point for the post request.The second argument to this post method,
and that argument is an object.It should be an object because it will
then be converted to JSON, which is data format automatically by axios.
We can also done with the log in by following the same implement below 
of the createUser but as they have similarities it is better to make it 
dynamically with the function above i.e authenticate function.*/
export function createUser(email, password) {
  /**
  const response = await axios.post(
    "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + API_KEY,
    {
      email: email,
      password: password,
      returnSecureToken: true /**In the context of Firebase Authentication 
      (a popular identity and authentication service), the "returnSecureToken" parameter typically refers to a request or configuration option.
      When you include "returnSecureToken" 
      as a parameter in certain API requests, it indicates that you want to receive a secure token as part of the response.  */
  /**   }
  );*/
  /**The mode value passed as argument here is a part of the URL 
provided for sign in and sign up in the firebase rest api docs.So 
we must report it as it spell there to expects request success.*/
  return authenticate("signUp", email, password);
}

export function login(email, password) {
  return authenticate("signInWithPassword", email, password);
}
