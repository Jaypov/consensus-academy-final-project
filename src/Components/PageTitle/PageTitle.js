import { Typography } from '@material-ui/core';

export default function PageTitle({ children }) {
    return <Typography variant="h5" style={{fontWeight: 100, marginBottom: '30px'}}> {children} </Typography>
}