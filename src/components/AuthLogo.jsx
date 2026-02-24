import React from 'react';
import { Grid } from "@mui/material";
import logoFemase from '../assets/logo_femase.png';

const AuthLogo = () => (
  <Grid item xs={12} display="flex" justifyContent="center">
    <img src={logoFemase} alt="Logo" style={{ maxHeight: '60px' }} />
  </Grid>
);

export default AuthLogo;