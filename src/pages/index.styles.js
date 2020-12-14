import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  cardHeader: {
    borderBottom: 'solid 1px lightgrey'
  },
  infoCard: {
      textAlign: 'center'
  },
  noContent: {
      textAlign: 'center',
      color: theme.palette.primary.main
  },
  margin: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  textField: {
    width: '100%',
  },
  success: {
    color: theme.palette.success.main
  },
  error: {
    color: theme.palette.error.main
  }
}));