import React from 'react';
import { Box, CssBaseline, Grid, Paper } from "@mui/material";

const AuthLayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: { xs: "#ffffff", sm: "#1565c0" }
      }}
    >
      <CssBaseline />
      <Grid item xs={12} sm={8} md={5} lg={4}>
        <Paper
          elevation={0}
          sx={{
            bgcolor: "white",
            borderRadius: { xs: 0, sm: 3 },
            minHeight: { xs: "100vh", sm: "auto" },
            p: { xs: 2, sm: 4 },
            boxShadow: { xs: "none", sm: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: "center"
          }}
        >
          <Grid container direction="column" spacing={3} sx={{ width: "100%" }}>
            {children}
          </Grid>
        </Paper>
      </Grid>
    </Box>
  );
};

export default AuthLayout;