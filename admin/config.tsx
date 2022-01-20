/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@keystone-ui/core';

import ausSpeedrunsLogo from '../styles/img/AusSpeedruns-Logo-Orange-FullWordmark.svg';

function CustomLogo () {
    return <img css={{width: 200}} src={ausSpeedrunsLogo.src} />
}

export const components = {
    Logo: CustomLogo
}
