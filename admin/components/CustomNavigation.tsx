import { NavigationContainer, ListNavItems, NavItem } from '@keystone-6/core/admin-ui/components';
import type { NavigationProps } from '@keystone-6/core/admin-ui/components';

import ASIcon from '../../styles/img/AS-Icon-Orange-Admin.svg';

export function CustomNavigation({ lists, authenticatedItem }: NavigationProps) {
	return (
		<NavigationContainer authenticatedItem={authenticatedItem}>
			<NavItem href="/">Dashboard</NavItem>
			<ListNavItems lists={lists} />
            <NavItem href="/runs-manager"><img src={ASIcon.src} height={17} /> Runs Manager</NavItem>
            <NavItem href="/ticket-pickup"><img src={ASIcon.src} height={17} /> Ticket Pickup/Podium</NavItem>
            <NavItem href="/incentives-dashboard"><img src={ASIcon.src} height={17} /> Incentives Dashboard</NavItem>
		</NavigationContainer>
	);
}
