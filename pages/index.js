import App from '../components/App';
import InfoBox from '../components/InfoBox';
import SignUp from '../components/SignUp';
import LogIn from '../components/LogIn';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { withApollo } from '../lib/graphql/apollo';
import { useState, useEffect } from 'react';
import gql from 'graphql-tag';

const IndexPage = () => {
  const LOGOUT_USER = gql`
    mutation logoutUser {
      logoutUser
    }
  `;

  const VALIDATE_COOKIE = gql`
    query validateCookie {
      validateCookie
    }
  `;
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [logoutUser, { loading: logoutLoading }] = useMutation(LOGOUT_USER, {
    onCompleted: (data) => {
      console.log('logout completed');
      setIsUserLoggedIn(false);
    },
  });
  const { loading: validateLoading, error, data } = useQuery(VALIDATE_COOKIE, {
    onCompleted: (data) => {
      console.log('validation completed');
      if (!data.validateCookie) {
        setIsUserLoggedIn(false);
      } else {
        setIsUserLoggedIn(true);
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });
  return (
    <App>
      <InfoBox>
        ⛔️
        <strong>
          Please don't use a real email address, this is publicly available.
        </strong>
      </InfoBox>
      <InfoBox>
        This example shows how to signup/login and setup an httpOnly cookie
        while also validating said cookie on focus and on every initial render.
        Check out /api/graphql for the graphql playground
      </InfoBox>
      <InfoBox>Checkout Application -> Cookies in the devtools</InfoBox>
      <InfoBox>
        Is user logged in? <strong>{isUserLoggedIn ? 'TRUE' : 'FALSE'}</strong>
      </InfoBox>
      {!isUserLoggedIn ? null : (
        <div>
          <h2>LogOut</h2>
          <button type="button" disabled={logoutLoading} onClick={logoutUser}>
            Submit
          </button>
        </div>
      )}
      {isUserLoggedIn ? null : (
        <>
          <SignUp setIsUserLoggedIn={setIsUserLoggedIn} />
          <LogIn setIsUserLoggedIn={setIsUserLoggedIn} />
        </>
      )}
    </App>
  );
};

export default withApollo({ ssr: false })(IndexPage);
