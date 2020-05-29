import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

export default function LogIn({ setIsUserLoggedIn }) {
  const LOGIN_USER = gql`
    mutation loginUser($data: LoginUserInput!) {
      loginUser(data: $data)
    }
  `;
  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      console.log('completed', data.loginUser);
      setIsUserLoggedIn(true);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new window.FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    form.reset();

    loginUser({
      variables: {
        data: {
          email,
          password,
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>LogIn</h2>
      <input placeholder="email" name="email" type="email" required />
      <input placeholder="password" name="password" type="password" required />
      <button type="submit" disabled={loading}>
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
