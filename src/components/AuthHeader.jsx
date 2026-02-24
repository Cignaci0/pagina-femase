import React from 'react';
import { Grid, Typography } from '@mui/material';
import logoFemase from '../assets/logo_femase.png';

const AuthHeader = ({ title, subtitle }) => (
  <Grid container direction="column" spacing={2} sx={{ mb: 3 }}>
    <Grid item xs={12} display="flex" justifyContent="center">
      <img src={logoFemase} alt="Logo" style={{ maxHeight: '60px' }} />
    </Grid>
    <Grid item xs={12}>
      <Typography variant="h5" component="h1" textAlign="center" fontWeight="400">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
          {subtitle}
        </Typography>
      )}
    </Grid>
  </Grid>
);

export default AuthHeader;