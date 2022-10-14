// import '../styles/globals.css'
import '../styles/global.scss';
import '../styles/App.scss';
import { withUrqlClient } from 'next-urql';
import { dedupExchange, cacheExchange, fetchExchange } from '@urql/core';

import { AuthProvider } from '../components/auth';
import CookieConsent from 'react-cookie-consent';

function AusSpeedrunsWebsite({ Component, pageProps }) {
	return (
		<AuthProvider>
			<Component {...pageProps} />
			<CookieConsent
				style={{ fontSize: '1.5rem' }}
				buttonStyle={{ background: '#CC7722', color: '#FFFFFF', fontSize: '1.5rem' }}
			>
				This website uses cookies to function.
			</CookieConsent>
		</AuthProvider>
	);
}

export default withUrqlClient((_ssrExchange, ctx) => ({
	url: typeof window === undefined ? 'http://localhost:8000/api/graphql' : '/api/graphql',
}))(AusSpeedrunsWebsite);
