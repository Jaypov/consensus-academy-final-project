import { useWeb3React } from '@web3-react/core';
import { CardContent, CardMedia, Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import { useStyles } from './ProfileCard.stlyes'
import makeBlockie from 'ethereum-blockies-base64';
import { useBalance } from '../../Utils/hooks';
import Web3 from 'web3'

export default function ProfileCard() {
    const classes = useStyles();
    const context = useWeb3React();
    const balance = useBalance();
    const { account, library } = context;

    const web3 = new Web3();
    const bal = balance ? web3.utils.fromWei(balance).substring(0, 6) : "0";

    function networkName(){
        let network = library?._network?.name;
        if(network === "unknown") network = "private" 
        return network
    }

    return (
        <Card className={classes.root}>
            <Paper square className={classes.head} />

            <CardMedia 
                component='img' 
                src={account? makeBlockie(account) : ""} 
                className={classes.cardmedia}
            /> 

            <CardContent>
                <div className={classes.textNode}>
                    <Typography variant="caption">
                        {account}
                    </Typography>
                </div>
                <div className={classes.textNode}>
                    <Typography variant="caption"> Network </Typography>
                    <Typography> {networkName()} </Typography>                    
                </div>                
                <div className={classes.textNode}>
                    <Typography variant="caption"> ETH </Typography>
                    <Typography> {bal} </Typography>                    
                </div>
            </CardContent>
        </Card>
    )
}
