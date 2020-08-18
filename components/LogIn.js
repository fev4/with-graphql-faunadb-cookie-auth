import React from 'react';
import { useMutation } from 'react-query';
import { request } from 'graphql-request';

import { user } from './UserContext';

const LOGIN_USER = `
    mutation loginUser($data: LoginUserInput!) {
      loginUser(data: $data) {
        userId
        userToken
      }
    }
  `;

export default function LogIn() {
  const { setId } = user();
  const [loginUser, { status: loginStatus }] = useMutation(
    (variables) => {
      return request('/api/graphql', LOGIN_USER, variables);
    },
    {
      onSuccess: (data) => {
        setId(data.loginUser.userId);
        localStorage.setItem('userId', data.loginUser.userId);
      },
      onError: (err) => {
        console.log(err.message);
      },
    }
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new window.FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    form.reset();

    await loginUser({
      data: {
        email,
        password,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>LogIn</h2>
      <input placeholder="fake email" name="email" type="email" required />
      <input placeholder="password" name="password" type="password" required />
      <button type="submit" disabled={loginStatus === 'loading'}>
        Submit
      </button>
      <style jsx>{`
        form {
          border-bottom: 1px solid #ececec;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 20px;
        }
        input {
          display: block;
          margin-bottom: 10px;
        }
      `}</style>
    </form>
  );
}
