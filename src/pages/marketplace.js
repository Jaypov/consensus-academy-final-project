import React, { useState } from 'react'
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { useEagerConnect, useInactiveListener, getLibrary } from '../Utils/hooks';
import Title from '../Components/PageTitle'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Typography } from '@material-ui/core';
import { useStyles } from './marketplace.styles';
import { useMarketplaceContract } from '../Utils/useResearchMarketPlace';
import TextField from '@material-ui/core/TextField';
import ProfileCard from '../Components/ProfileCard';
import ProjectCard from '../Components/ProjectCard';
import ManageDialog from '../Components/ManageDialog';
import MatMaskMessage from '../Components/ConnectMetaMask';

export default function Default() {  
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <MarketPlace />
    </Web3ReactProvider>
  )
};

function MarketPlace() {
    const classes = useStyles();
    const { acceptedProjects, pendingProjects } = useMarketplaceContract();  
    const [selectedValue, setSelectedValue] = React.useState();
    const [open, setOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [selectedManageId, setSelectedManageId] = useState();
    const context = useWeb3React();
    const { active } = context;

    const triedEager = useEagerConnect()
    useInactiveListener(!triedEager)

    const allProjects = [ ...acceptedProjects, ...pendingProjects ];

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
        setSelectedValue(value);
    };

    if(!active) {
      return <MatMaskMessage />
    }

    return (
        <div className={classes.container}>
            <Title>
                Marketplace
            </Title>
            <Button className={classes.createButton} variant="outlined" color="primary" onClick={handleClickOpen}>
                Create Project
            </Button>
            
            <CreateDialog selectedValue={selectedValue} open={open} onClose={handleClose} />
            <ManageDialog 
              open={manageOpen} 
              onClose={() => setManageOpen(!manageOpen)} 
              project={allProjects.filter(p => p.projectId == selectedManageId)[0] || {}}
            />

            <Grid container spacing={3}>
              <Grid container xs={3} style={{ padding: '13px' }}>
                <Grid item xs={12}>
                  <ProfileCard />
                </Grid>
              </Grid>
              <Grid container xs={9} spacing={1} style={{ padding: '13px' }}>
                {allProjects.length === 0 &&
                  <Typography className={classes.noContent} color="primary">
                    CURRENTLY NO RESEARCH PROJECTS
                  </Typography>
                }

                {allProjects.map(p => (
                  <Grid item xs={6}>
                    <ProjectCard project={p} open={(id) => {
                      setSelectedManageId(id);
                      setManageOpen(true)
                    }}/>
                  </Grid>
                ))}
              </Grid>
            </Grid>
        </div>
    )
}

function CreateDialog(props) {
  const classes = useStyles();
  const { onClose, selectedValue, open } = props;
  const { createProject } = useMarketplaceContract();  

  const [projectName, setProjectName] = useState("");
  const [email, setEmail] = useState("");
  const [entityName, setEntityName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);

  const handleClose = () => {
    onClose(selectedValue);
  };

  const create = () => {
    if(
      projectName.replace(/\s+/g, '').length === 0 ||
      email.replace(/\s+/g, '').length === 0 ||
      entityName.replace(/\s+/g, '').length === 0 ||
      phone.replace(/\s+/g, '').length === 0
    ) {
      setIsError(true);
      error("All feilds are required");
      return
    }
    
    createProject(projectName, email, entityName, phone)
      .then(() => {
        console.log("CLOSING")
        handleClose()
      })
      .catch(e => { console.log(e) });
  }

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">Prject Application</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <DialogContentText>
          Please enter the title of your research project along with information participants can contact you on
        </DialogContentText>
        <TextField id="standard-basic" label="Project Name" className={classes.dialogInput} onChange={(e) => setProjectName(e.target.value)}/>
        <TextField id="standard-basic" label="Entity Name" className={classes.dialogInput} onChange={(e) => setEntityName(e.target.value)}/>
        <TextField id="standard-basic" label="Project Email Contact" className={classes.dialogInput} onChange={(e) => setEmail(e.target.value)}/>
        <TextField id="standard-basic" label="Project Phone Contact" className={classes.dialogInput} onChange={(e) => setPhone(e.target.value)}/>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="outlined" color="primary" onClick={create}>
          Request Project
        </Button>
      </DialogActions>      
    </Dialog>
  );
}

