import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    top: 0,
    background: theme.palette.primary.main,
    width: '100vw',
    height: '100vh',
    left: 0,
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}));


export default function ConnectMetaMask() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
              <Typography>Must acctivate metamask</Typography>
        </div>
    )
}