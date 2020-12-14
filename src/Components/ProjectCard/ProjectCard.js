import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { Button, CardActions, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import makeBlockie from 'ethereum-blockies-base64';
import { useStyles } from './ProjectCard.stlyes';
import { useProjectContract } from '../../Utils/useProjectContract';

export default function ProjectCard({project, open}) {
    if(!project) return null;
    const classes = useStyles();
    const { owner, email, entityName, phone, projectContract, projectId, projectName, status } = project;
    const { status: projectStatus, pendingParticipants, acceptedParticipants, applyForProject, withdrawFounds, acceptedParticipantList } = useProjectContract(projectContract);
    const context = useWeb3React();
    const { account } = context;

    function participationStatus() {
        if(acceptedParticipants.some(p => p === account)){
            return <Typography variant="caption" className={classes.accepted}> Accepted </Typography>
        }

        if(pendingParticipants.some(p => p === account)){
            return <Typography variant="caption" className={classes.pending}> Pending </Typography>
        }

        return <Typography variant="caption" className={classes.error}> Unregisterd </Typography>
    }
    
    function areEnrolled() {
        return acceptedParticipants.some(p => p === account) || pendingParticipants.some(p => p === account)
    }

    function apply() {
        applyForProject()
        .catch(console.log)
    }

    function withdrawReward() {
        withdrawFounds()
        .catch(e => console.log("Cannot withdraw", e))
    }

    console.log(acceptedParticipantList, account)
    console.log(projectStatus !== "ENDED", acceptedParticipantList[account])
    console.log(projectStatus !== "ENDED" && acceptedParticipantList[account])

    return (
        <Card className={classes.root}>
            <Paper square className={classes.head} />

            <CardMedia 
                component='img' 
                src={owner? makeBlockie(owner) : ""} 
                className={classes.cardmedia}
            /> 

            <CardContent>
                <Grid container>
                    <Grid xs={6}><Typography variant="caption">Project Name</Typography></Grid>
                    <Grid xs={6}><Typography variant="caption">{projectName}</Typography></Grid>
                    <Grid xs={6}><Typography variant="caption">Entity Name</Typography></Grid>
                    <Grid xs={6}><Typography variant="caption">{entityName}</Typography></Grid>
                    <Grid xs={6}><Typography variant="caption">Contract</Typography></Grid>
                    <Grid xs={6}><Typography variant="caption">{truncate(projectContract)}</Typography></Grid>
                    <Grid xs={6}><Typography variant="caption">Owner</Typography></Grid>
                    <Grid xs={6}><Typography variant="caption">{truncate(owner)}</Typography></Grid>   
                    <Grid xs={6}><Typography variant="caption">Phone</Typography></Grid>
                    <Grid xs={6}><Typography variant="caption">{phone}</Typography></Grid>    
                    <Grid xs={6}><Typography variant="caption">Email</Typography></Grid>
                    <Grid xs={6}><Typography variant="caption">{email}</Typography></Grid>    
                    <Grid xs={6}><Typography variant="caption">Project marketpalce status</Typography></Grid>
                    <Grid xs={6}>
                        <Typography variant="caption" className={getStatusClass(status, classes)}>
                            {getStatus(status)}
                        </Typography>
                    </Grid>         
                    <Grid xs={6}><Typography variant="caption">Project status</Typography></Grid>
                    <Grid xs={6}>
                        <Typography variant="caption" className={projectStatusClass(projectStatus, classes)}>
                            {projectStatus}
                        </Typography>
                    </Grid>                                                                        
                </Grid>
            </CardContent> 
            <CardContent>
                <Grid container>
                    <Grid xs={6}><Typography variant="caption">Your participation status</Typography></Grid>    
                    <Grid xs={6}>{participationStatus()}</Grid>
                </Grid>
            </CardContent>
            <CardActions>
                <Button 
                    variant="outlined" 
                    fullWidth 
                    size="small" 
                    disabled={projectStatus !== "REGESTRATION" || areEnrolled()}
                    onClick={() => apply()}
                > 
                    Apply 
                </Button>
                <Button 
                    variant="outlined" 
                    fullWidth 
                    size="small" 
                    disabled={                        
                        acceptedParticipantList[account]? false:true
                    }
                    onClick={withdrawReward}
                > 
                    Withdraw 
                </Button>
                <Button variant="outlined" fullWidth size="small" 
                    onClick={() => open(projectId)}
                    disabled={
                        (account === owner && getStatus(status) === "ACCEPTED") ?
                        false : true
                    }
                > 
                    Manage 
                </Button>
            </CardActions>
        </Card>
    )
}

function projectStatusClass(status, classes) {
    if(status === "CONFIG") return classes.pending;
    if(status === "REGESTRATION") return classes.pending;
    if(status === "IN PROGRESS") return classes.accepted;
    if(status === "ENDED") return classes.error;
}

function getStatus(status) {
    if(status === "0") return "PENDING" ;
    if(status === "1") return "ACCEPTED";
    return "UNKNOWN";
}

function getStatusClass(status, classes) {
    if(status === "0") return classes.pending ;
    if(status === "1") return classes.accepted;
    return classes.pending;
}

function truncate(str) {
  if (str.length > 35) {
    return str.substr(0, 5) + '...' + str.substr(str.length-5, str.length);
  }
  return str;
}