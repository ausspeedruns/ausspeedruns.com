import React from 'react'
import clsx from 'clsx'
import styles from './logo.module.css'

import LogoSVG from './Ausspeedruns_Logo.svg'

interface Props {
  className?: string
}

export const Logo = (props: Props) => {
  const { className } = props

  return <LogoSVG className={clsx(styles.logo, className)} />
}
