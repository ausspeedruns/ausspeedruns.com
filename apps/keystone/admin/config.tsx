import type { AdminConfig } from '@keystone-6/core/types';
import { CustomNavigation } from './components/CustomNavigation';

import ausSpeedrunsLogo from './assets/AusSpeedruns-Logo-Orange-FullWordmark.svg';

function CustomLogo () {
    return <img alt="AusSpeedruns Logo" style={{width: 200}} src={ausSpeedrunsLogo.src} />
}

export const components: AdminConfig['components']= {
    Navigation: CustomNavigation,
    Logo: CustomLogo,
}
