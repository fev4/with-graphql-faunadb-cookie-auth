import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const SIGNUP_USER = gql`
  mutation signupUser($data: CreateUserInput!) {
    signupUser(data: $data)
  }
`;

export default function SignUp({ setIsUserLoggedIn }) {
  const [signupUser, { loading }] = useMutation(SIGNUP_USER, {
    onCompleted: (data) => {
      console.log('completed', data.signupUser);
      setIsUserLoggedIn(true);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new window.FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    form.reset();

    signupUser({
      variables: {
        data: {
          email,
          password,
          role: 'FREE_USER',
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>SignUp</h2>
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
