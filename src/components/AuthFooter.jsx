import React from 'react';
import { Grid, Typography } from "@mui/material";

const AuthFooter = () => (
  <Grid item xs={12}>
    <Typography variant="body2" color="text.secondary" textAlign="center">
      Versión 5.1.193 - Diseñado por{" "}
      <a
        href="https://femase.cl/"
        style={{ textDecoration: "none", color: "#1565c0" }}
      >
        femase
      </a>{" "}
      © 2017-2026
    </Typography>
  </Grid>
);

export default AuthFooter;