import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Container from '@material-ui/core/Container';
import { useWeb3React } from '@web3-react/core';
import { useStyles } from './Layout.styles';
import { Button, Typography } from '@material-ui/core';
import Link from 'next/link';

export default function Layout({ children }) {
  const classes = useStyles();
  const context = useWeb3React();
  const { connector, library, chainId, account, activate, deactivate, active, error } = context

  return (
    <div>
        <AppBar position="static" className={classes.root} position="fixed">
            <Toolbar style={{ minHeight: '0px' }}>
                <Container maxWidth='md' className={classes.navigation}>
                    <div className={classes.nav}>
                        <Link href="/">
                            <div className={classes.navItem}>
                                <Typography variant="body2"> 
                                    Admin 
                                </Typography>
                            </div>
                        </Link>
                        
                        <Link href="/marketplace">
                            <div className={classes.navItem}>
                                <Typography variant="body2" > 
                                    Marketplace
                                </Typography>
                            </div>
                        </Link>
                    </div>
                </Container>
            </Toolbar>
        </AppBar>
        <div className={classes.background}>
            <Container maxWidth='md' className={classes.contentContainer}>
                { children }
            </Container>
        </div>
    </div>
  );
}