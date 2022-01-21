// import '../styles/globals.css'
import '../styles/global.scss';
import '../styles/App.scss';
import { createClient, Provider, defaultExchanges } from 'urql';
import { devtoolsExchange } from '@urql/devtools';

import { AuthProvider } from '../components/auth';

export const client = createClient({
	url: typeof window === undefined ? 'http://localhost:8000/api/graphql' : '/api/graphql',
	exchanges: [devtoolsExchange, ...defaultExchanges],
});

function MyApp({ Component, pageProps }) {
	return (
		<Provider value={client}>
			<AuthProvider>
				<Component {...pageProps} />
			</AuthProvider>
		</Provider>
	);
}

export default MyApp;
