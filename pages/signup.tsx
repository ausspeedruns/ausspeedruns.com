import { useState } from 'react';
import { gql, useMutation } from 'urql';

import Button from '../components/Button/Button';
import Navbar from '../components/Navbar/Navbar';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Footer from '../components/Footer/Footer';

export default function SignUpPage() {
	const [{ error, data }, signup] = useMutation(gql`
		mutation ($name: String!, $email: String!, $password: String!) {
			createUser(data: { name: $name, email: $email, password: $password }) {
				__typename
				id
			}
			authenticateUserWithPassword(email: $email, password: $password) {
				__typename
			}
		}
	`);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const router = useRouter();

	return (
		<div className="App">
			<Navbar />
      <div className="content">

        <h1>Join</h1>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            signup({ name, email, password }).then((result) => {
              if (result.data?.createUser) {
                // FIXME: there's a cache issue with Urql where it's not reloading the
                // current user properly if we do a client-side redirect here.
                // router.push('/');
                top.location.href = '/';
              }
            });
          }}
        >
          {error && <div>{error.toString()}</div>}
          <div style={{ margin: '4px 0' }}>
            <div style={{ display: 'inline-block', width: '9rem' }}>Name</div>
            <input
              type="text"
              onChange={(event) => {
                setName(event.target.value);
              }}
            />
          </div>
          <div style={{ margin: '4px 0' }}>
            <div style={{ display: 'inline-block', width: '9rem' }}>Email address</div>
            <input
              type="text"
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
          </div>
          <div style={{ margin: '4px 0' }}>
            <div style={{ display: 'inline-block', width: '9rem' }}>Password</div>
            <input
              type="password"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
          </div>
          <Button type="submit" colorScheme="primary" actionText="Sign In" link="" />
        </form>
        <hr className="my-4" />
        <div>
          <Link href="/signin">Already have an account? Sign in</Link>
        </div>
      </div>
		</div>
	);
}
