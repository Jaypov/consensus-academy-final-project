import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: '250px',
  },
  head: {
    background: theme.palette.primary.main, 
    height: '100px !important'
  },
  cardmedia: {
    borderRadius: '50%',
    width: '30%',
    margin: 'auto',
    marginTop: '-50px',
    padding: '3px',
    background: 'white'
  },
  textNode: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '10px',
    textAlign: 'center'
  }
}));