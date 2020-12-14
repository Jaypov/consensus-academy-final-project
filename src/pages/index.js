import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { useEagerConnect, useInactiveListener, getLibrary } from '../Utils/hooks';
import ProfileCard from '../Components/ProfileCard';
import MatMaskMessage from '../Components/ConnectMetaMask';
import Title from '../Components/PageTitle';
import { useMarketplaceContract } from '../Utils/useResearchMarketPlace';
import { Grid, List, ListItem, ListItemText, 
  ListItemSecondaryAction, IconButton, Card, 
  CardHeader, Typography, CardContent, TextField, Button 
} from '@material-ui/core';
import { useStyles } from './index.styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import clsx from 'clsx';
import { useState } from 'react';
import SnackBar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

export default function Default() {  
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  )
};

function App() {
  const classes = useStyles();
  const context = useWeb3React();
  const { fee, balance, acceptedProjects, pendingProjects, updateFee, acceptProject, rejectProject } = useMarketplaceContract();  
  const [ feePrice, setFeePrice ] = useState();
  const [ open, setOpen] = useState(false);
  const [ snackError, setError ] = useState("");
  const { active } = context;

  const triedEager = useEagerConnect()
  useInactiveListener(!triedEager)

  const updateFeePrice = () => {
    if(typeof feePrice !== 'string') return;
    updateFee(feePrice)
    .catch(e => {
      setError(e.message);
      setOpen(true)
    })
  }

  const accept = id => {
    acceptProject(id).catch(e => console.log(e))
  }

  const reject = id => {
    rejectProject(id).catch(e => console.log(e))
  }

  if(!active) {
    return <MatMaskMessage />
  }

  return (<>
    <SnackBar open={open} autoHideDuration={6000} onClose={() => setOpen(!open)} 
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}>
      <MuiAlert elevation={6} variant="filled" severity="error">
        {snackError}
      </MuiAlert>
    </SnackBar>  
    <Title> Admin </Title>
    <Grid container spacing={3}>
      <Grid container xs={4} spacing={3} style={{ padding: '13px' }}>
        <Grid item xs={12}>
          <ProfileCard />
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent className={classes.infoCard}>
              <Typography variant="overline">
                Update Fee
              </Typography>
              <TextField
                label="Fee Price"
                id="outlined-start-adornment"
                className={clsx(classes.margin, classes.textField)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">wei</InputAdornment>,
                }}
                variant="outlined"
                onChange={(e) => setFeePrice(e.target.value)}
              />
              <Button variant="outlined" color="primary" fullWidth onClick={updateFeePrice}>
                Update
              </Button>
            </CardContent>
          </Card>
        </Grid>  
      </Grid>
      <Grid container xs={8} spacing={3} style={{ padding: '13px' }}>
        <Grid item xs={6}>
          <Card>
            <CardContent className={classes.infoCard}>
              <Typography variant="overline">
                Application Fee
              </Typography>
              <Typography>
                {fee}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card>
            <CardContent className={classes.infoCard}>
              <Typography variant="overline">
                Contract Balance
              </Typography>
              <Typography>
                {balance}
              </Typography>
            </CardContent>
          </Card>
        </Grid> 
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={<Typography> Pending Projects </Typography>}
              className={classes.cardHeader}
            />
            { pendingProjects.length === 0 ?
              <CardContent className={classes.noContent}>
                <Typography> No Pending Projects </Typography>
              </CardContent>
            :
              <List dense>
                {pendingProjects.map(p => {
                  return <ListItem>
                    <ListItemText
                      primary={p.projectName}
                      secondary={<div>
                        <div>
                          <Typography variant="caption">Entity: </Typography>
                          <Typography variant="caption">{p.entityName}</Typography>
                        </div>
                        <div>
                          <Typography variant="caption">Requester: </Typography>
                          <Typography variant="caption">{p.owner}</Typography>
                        </div>
                        <div>
                          <Typography variant="caption">Project Id: </Typography>
                          <Typography variant="caption">{p.projectId}</Typography>
                        </div>
                      </div>}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        className={classes.success} 
                        onClick={() => accept(p.projectId)}
                      >
                        <CheckCircleOutlineIcon />
                      </IconButton>
                      <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          className={classes.error} 
                          onClick={() => reject(p.projectId)}
                      >                        
                        <HighlightOffIcon />
                      </IconButton>                                            
                    </ListItemSecondaryAction>
                  </ListItem>
                })}
              </List>
            }
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={<Typography> Accepted Projects </Typography>}
              className={classes.cardHeader}
            />
            { acceptedProjects.length === 0 ?
              <CardContent className={classes.noContent}>
                <Typography> No Accepted Projects </Typography>
              </CardContent>
            :
              <List dense>
                {acceptedProjects.map(p => {
                  return <ListItem>
                    <ListItemText
                      primary={p.projectName}
                      secondary={<div>
                        <div>
                          <Typography variant="caption">Entity: </Typography>
                          <Typography variant="caption">{p.entityName}</Typography>
                        </div>
                        <div>
                          <Typography variant="caption">Requester: </Typography>
                          <Typography variant="caption">{p.owner}</Typography>
                        </div>
                        <div>
                          <Typography variant="caption">Project Id: </Typography>
                          <Typography variant="caption">{p.projectId}</Typography>
                        </div>
                      </div>}
                    />
                  </ListItem>
                })}
              </List>
            }
          </Card>
        </Grid>  
      </Grid>      
    </Grid>
  </>)
}