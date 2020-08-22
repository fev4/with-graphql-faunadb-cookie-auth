import React, { useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import { request } from 'graphql-request';

import App from '../components/App';
import InfoBox from '../components/InfoBox';
import SignUp from '../components/SignUp';
import LogIn from '../components/LogIn';
import ThingList from '../components/ThingsList';
import { user } from '../components/UserContext';

const LOGOUT_USER = `
    mutation logoutUser {
      logoutUser
    }
  `;

const VALIDATE_COOKIE = `
    query validateCookie {
      validCookie
    }
  `;

const IndexPage = () => {
  const { id, setId } = user();

  const [logoutUser, { status: logoutStatus }] = useMutation(
    () => {
      return request('/api/graphql', LOGOUT_USER);
    },
    {
      onSuccess: () => {
        console.log('Logout success');
        localStorage.removeItem('userId');
        setId('');
      },
    }
  );

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    userId ? setId(userId) : setId('');
  }, []);

  // Should only validate when user is logged in and every 5 minutes
  const { status: validateStatus, isFetching: isValidateFetching } = useQuery(
    ['validCookie'],
    async () => {
      const res = await request('/api/graphql', VALIDATE_COOKIE);
      return res;
    },
    {
      onSuccess: (data) => {
        if (data.validCookie === true) {
          /* No need to do anything else, the `userId` is handled in the `useEffect` */
          console.log('Validation success');
        } else {
          console.log('Custom cookie not valid');
          logoutUser();
        }
      },
      onError: (err) => {
        console.log(err);
      },
    }
  );

  return (
    <App>
      <InfoBox>
        This example shows how to signup/login and setup an httpOnly cookie
        while also validating said cookie on focus and on every initial render.
      </InfoBox>
      <InfoBox>
        Try duplicating the tab, logging out in the new one, and then navigating
        back to the original. It should automatically logout, syncing both tabs.
      </InfoBox>
      <InfoBox>Lookout for &quot;custom_cookie&quot; in the devtools</InfoBox>
      <InfoBox>
        <strong>Try to log in with:</strong>
        <br />
        email: 123@example.com
        <br />
        password: 123
      </InfoBox>
      <InfoBox>
        Is cookie being validated?{' '}
        <strong>
          {validateStatus === 'loading' || isValidateFetching
            ? 'TRUE'
            : 'FALSE'}
        </strong>
      </InfoBox>
      <InfoBox>
        Is user logged in? <strong>{id ? 'TRUE' : 'FALSE'}</strong>
      </InfoBox>
      {!id ? null : (
        <div>
          <h2>LogOut</h2>
          <button
            type="button"
            disabled={logoutStatus === 'loading'}
            onClick={logoutUser}
          >
            Submit
          </button>
          <ThingList />
        </div>
      )}
      {id ? null : (
        <>
          <LogIn />
          <SignUp />
        </>
      )}
    </App>
  );
};

export default IndexPage;
