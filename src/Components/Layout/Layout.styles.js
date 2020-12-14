import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '0px !important',
    backgroundColor: theme.palette.common.white,
    borderBottom: '1px solid rgba(0,40,100,.12)',
    borderTop: '1px solid rgba(0,40,100,.12)',
    boxShadow: 'none'
  },
  navigation: {
      color: theme.palette.primary.main,
      display: 'flex',
      justifyContent: 'space-between'
  },
  background: {
      backgroundColor: theme.palette.background.default,
      height: '100vh'
  },
  contentContainer: {
    marginTop: '49px',
    paddingTop: '1.5rem'
  },
  nav: {
    listStyleType: 'none',
    display: 'flex'
  },
  active: {
    color: `${theme.palette.primary.main} !important`,
    borderBottom: `1px solid ${theme.palette.primary.main}`
  },
  navItem: {
    textDecoration: 'none',
    color: theme.palette.primary.contrastText,
    paddingTop: '13px',
    paddingBottom: '13px',
    marginRight: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    cursor: 'pointer'
  }
}));