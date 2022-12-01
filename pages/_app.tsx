// import '../styles/globals.css'
import '../styles/global.scss';
import '../styles/App.scss';
import { withUrqlClient } from 'next-urql';

import { AuthProvider } from '../components/auth';
import CookieConsent from 'react-cookie-consent';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { gql, useQuery } from 'urql';

const QUERY_EVENTS = gql`
	query {
		events {
			shortname
			endDate
			published
		}
	}
`;

function AusSpeedrunsWebsite({ Component, pageProps }) {
	const [events] = useQuery({ query: QUERY_EVENTS });

	return (
		<AuthProvider>
			<Navbar events={events.data?.events} />
			<Component {...pageProps} />
			<Footer />
			<CookieConsent
				style={{ fontSize: '1.5rem' }}
				buttonStyle={{ background: '#CC7722', color: '#FFFFFF', fontSize: '1.5rem' }}
			>
				This website uses cookies to function.
			</CookieConsent>
		</AuthProvider>
	);
}

export default withUrqlClient((_ssrExchange) => ({
	url: typeof window === undefined ? 'http://localhost:8000/api/graphql' : '/api/graphql',
}))(AusSpeedrunsWebsite);
