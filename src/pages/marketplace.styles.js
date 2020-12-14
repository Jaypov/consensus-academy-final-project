import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
    container: {
        position: 'relative'
    },
    createButton: {
        position: 'absolute',
        top: theme.spacing(0),
        right: theme.spacing(0),
    },
    dialogContent: {
        display: 'flex',
        flexDirection: 'column'
    },
    dialogInput: {
        margin: '10px'
    },
    noContent: {
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        width: '100%'
    },
    dialogTitle: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    updateBox: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center'
    },
    textFeild: {
        marginBottom: '10px'
    },
    dialogInfoCard: {
        textAlign: 'center',
        border: '1px solid lightgray'
    },
    success: {
        color: theme.palette.success.main
    },
    error: {
        color: theme.palette.error.main
    },
    warning: {
        color: theme.palette.success.main

    }
}));