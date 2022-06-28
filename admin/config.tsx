/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import type { AdminConfig } from '@keystone-6/core/types';
import { CustomNavigation } from './components/CustomNavigation';

import ausSpeedrunsLogo from '../styles/img/AusSpeedruns-Logo-Orange-FullWordmark.svg';

function CustomLogo () {
    return <img css={{width: 200}} src={ausSpeedrunsLogo.src} />
}

export const components: AdminConfig['components']= {
    Navigation: CustomNavigation,
    Logo: CustomLogo,
}
