import React, { useState } from 'react'
import { Button, Card, CardActions, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, ListSubheader, Typography } from '@material-ui/core';
import { useStyles } from './ManageDialog.styles';
import TextField from '@material-ui/core/TextField';
import { useProjectContract } from '../../Utils/useProjectContract';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

export default function ManageDialog(props) {
  const { onClose, selectedValue, open, project } = props;
  if(!project) return null;

  const classes = useStyles();  
  const { projectContract } = project;
  const { 
    hardCap, 
    reward, 
    status, 
    pendingParticipants,
    acceptedParticipants,
    balance,
    acceptedParticipantList,
    updateHardCap, 
    updateReward,
    openProject,
    startProject,
    acceptParticipant,
    rejectParticipant,
    sendEthToContract,
    endProject,
    obligationMet
  } = useProjectContract(projectContract)

  const [hardcapValue, setHardcapValue] = useState("");
  const [rewardValue, setRewardValue] = useState("");
  const [error, setError] = useState(false);

  const handleClose = () => {
    onClose(selectedValue);
  };


  const updateRewardAmount = () => {
    updateReward(rewardValue)
    .catch( e => {
        console.log(e)
    })
  }

  const updateHardcapAmount = () => {
    updateHardCap(hardcapValue)
    .catch(e => {
        console.log(e)
    })
  }

  const opentResearchProject = () => {
      openProject().catch(console.log)
  }

  const startResearchProject = () => {
    startProject().catch(e => {
      setError(e.message)
    })
  }

  const accept = (address) => {
    acceptParticipant(address).catch(e => {
      console.log(e)
    })
  }

  const reject = (address) => {
    rejectParticipant(address).catch(e => {
      console.log(e)
    })
  }

  const updateContractBalance = (wei) => {
    sendEthToContract(wei)
    .then(b => {
      console.log(b)
    })
    .catch(e => {
      console.log(e)
    })
  }

  const endResearchProject = () => {
    endProject();
  }

  const getStatus = (status) => {
    if(status === 'CONFIG') return 'Config stage';
    if(status === 'REGESTRATION') return 'Registration stage';
    if(status === 'IN PROGRESS') return 'Project in progress';
    if(status === 'ENDED') return 'Project has ended';
    return "Unknown";
  }

  const getStatusClass = (status, classes) => {
    if(status === 'CONFIG') return classes.warning;
    if(status === 'REGESTRATION') return classes.warning;
    if(status === 'IN PROGRESS') return classes.success;
    if(status === 'ENDED') return classes.error;
    return "Unknown";
  }

  const patientObligationMet = (address) => {
    obligationMet(address);
  }

  return(
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open} maxWidth="md">
      <DialogTitle className={classes.dialogTitle} component="div" disableTypography>
        <Typography variant="h6">Manage Project</Typography>
        <Typography className={getStatusClass(status, classes)}>{getStatus(status)}</Typography>
      </DialogTitle>

      {/* CONFIG STAGE */}
      {status === "CONFIG" && <>
        <DialogContent>
            <DialogContentText>
                <Typography>
                    This project is in the confguration stage, 
                </Typography>
                <Typography>
                  leving the hard cap at 0 will allow unlimited participants
                </Typography>
                <Typography>
                  leaving reward at 0 will not reward with ETH on completion
                </Typography>
            </DialogContentText>
          <Grid container className={classes.dialogContent}>
            <Grid container direction="row" spacing={3}>
              <Grid item xs="6">
                <CardContent className={classes.dialogInfoCard}>
                  <Typography variant="caption">Hardcap</Typography>
                  <Typography> {hardCap} </Typography>
                </CardContent>
              </Grid>
              <Grid item xs="6">
                <CardContent className={classes.dialogInfoCard}>
                  <Typography variant="caption">Reward</Typography>
                  <Typography> {reward} </Typography>
                </CardContent>
              </Grid>
            </Grid>
            <Grid container direction="row">
              <Grid item xs="6">
                <CardContent className={classes.updateBox}>
                  <Typography variant="caption"> update Hardcap</Typography>
                  <TextField id="standard-basic" className={classes.textFeild} onChange={(e) => setHardcapValue(e.target.value)}/>
                  <Button variant="outlined" onClick={updateHardcapAmount}>
                    Update
                  </Button>
                </CardContent>
              </Grid>    
              <Grid item xs="6">        
                <CardContent className={classes.updateBox}>
                  <Typography variant="caption">update Reward amount</Typography>
                  <TextField id="standard-basic" className={classes.textFeild} onChange={(e) => setRewardValue(e.target.value)}/>
                  <Button variant="outlined" onClick={updateRewardAmount}>
                    Update
                  </Button>
                </CardContent>            
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions container direction="row">
          <Button variant="outlined" color="primary" fullWidth onClick={opentResearchProject}>
            Open project to registration
          </Button>
        </DialogActions>
      </>}

      {/* REGISTRATION STAGE */}
      {status === "REGESTRATION" && <>
        <DialogContent style={{width: '600px'}}>
          <Grid container className={classes.dialogContent}>
            <Grid container direction="row" spacing={3}>
              <Grid item xs="4">
                <CardContent className={classes.dialogInfoCard}>
                  <Typography variant="caption">Hardcap</Typography>
                  <Typography> {hardCap} </Typography>
                </CardContent>
              </Grid>
              <Grid item xs="4">
                <CardContent className={classes.dialogInfoCard}>
                  <Typography variant="caption">Reward</Typography>
                  <Typography> {reward} </Typography>
                </CardContent>
              </Grid>
              <Grid item xs="4">
                <CardContent className={classes.dialogInfoCard}>
                  <Typography variant="caption">Contract Balance</Typography>
                  <Typography> {balance} </Typography>
                </CardContent>
              </Grid>              
            </Grid>
            <Grid container direction="row" spacing={3}>
              <Grid item xs="12">
                <Card className={classes.dialogContractUpdateCard} raised={false} elevation={0}>
                  <CardContent className={classes.dialogContractUpdateCardContent}>
                    <Typography variant="caption">Update contract balance</Typography>
                    <Typography variant="caption">{reward * acceptedParticipants.length} wei</Typography>
                  </CardContent>
                  <CardActions style={{width: '100%'}}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => updateContractBalance(reward * acceptedParticipants.length)}
                    >
                      Add balance to contract
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
            <Grid container direction="row" spacing={3}>
              <Grid item xs={12}>
                <div className={classes.applicantTable}>
                  <div className={classes.applicantTableHeader}>
                    <Typography variant="caption"> Pending applicants </Typography>
                  </div>
                  <List>
                    { pendingParticipants.length > 0 && pendingParticipants.map((p) => {  
                      return <ListItem>
                        <ListItemText>
                          <Typography variant="caption">{p}</Typography>
                        </ListItemText>
                        <ListItemSecondaryAction>
                          <IconButton 
                              edge="end" 
                              aria-label="delete" 
                              className={classes.success} 
                              onClick={() => accept(p)}
                          >    
                            <CheckCircleOutlineIcon />
                          </IconButton>
                          <IconButton 
                              edge="end" 
                              aria-label="delete" 
                              className={classes.error} 
                              onClick={() => reject(p)}
                          >    
                            <HighlightOffIcon />
                          </IconButton>   
                        </ListItemSecondaryAction>
                      </ListItem>              
                    })}
                
                    { pendingParticipants.length === 0 && 
                      <Typography className={classes.noContent}>
                        CURRENTLY NO PARTICIPANTS
                      </Typography>
                    }                  
                  </List>
                </div>
              </Grid>
            </Grid>
            <Grid container direction="row" spacing={3}>
              <Grid item xs={12}>
                <div className={classes.applicantTable}>
                  <div className={classes.applicantTableHeader}>
                    <Typography variant="caption"> Accepted applicants </Typography>
                  </div>
                  <List>
                    { acceptedParticipants.length > 0 && acceptedParticipants.map((p) => {  
                      return <ListItem>
                        <ListItemText>
                          {p}
                        </ListItemText>
                      </ListItem>              
                    })}
                
                    { acceptedParticipants.length === 0 && 
                      <Typography className={classes.noContent}>
                        CURRENTLY NO ACCEPTED PARTICIPANTS
                      </Typography>
                    }                  
                  </List>
                </div>
              </Grid>
            </Grid>            
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="primary" fullWidth onClick={startResearchProject}>
            Start Research Project
          </Button>              
        </DialogActions>
      </>}
    
      {status === "IN PROGRESS" && <>
        <DialogContent>
            <Grid container direction="row" spacing={3}>
              <Grid item xs={12} style={{width: '600px'}}>
                <div className={classes.applicantTable}>
                  <div className={classes.applicantTableHeader}>
                    <Typography variant="caption"> Patient research obbligations met </Typography>
                  </div>
                  <List>
                    { acceptedParticipants.length > 0 && acceptedParticipants.map((p) => {  
                      return <ListItem>
                        <ListItemText>
                          {p}
                        </ListItemText>
                        {(acceptedParticipantList && !acceptedParticipantList[p] )&&
                          <ListItemSecondaryAction>                       
                            <IconButton 
                                edge="end" 
                                aria-label="delete" 
                                className={classes.success} 
                                onClick={() => patientObligationMet(p)}
                            >    
                              <CheckCircleOutlineIcon />
                            </IconButton>                          
                          </ListItemSecondaryAction>
                        }
                      </ListItem>              
                    })}               
                  </List>
                </div>
              </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="primary" fullWidth onClick={endResearchProject}>
            End Research Project
          </Button> 
        </DialogActions>
      </>}

      {status === "ENDED" && <>
        <DialogContent style={{width: '400px'}}>
          <Typography className={classes.noContent}>
            Research project has ended
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="primary" variant="outlined" fullWidth onClick={handleClose}>
              OK
          </Button>
        </DialogActions>
      </>}

      { error && 
        <DialogContent>
          <Typography variant="caption" className={classes.error}>
            {error}
          </Typography>
        </DialogContent>
      }
    </Dialog>
  )
}