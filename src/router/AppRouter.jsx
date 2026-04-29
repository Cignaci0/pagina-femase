import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from "../pages/LOGIN/Login"
import RecuperarContrasena from "../pages/LOGIN/RecuperarContrasena"
import ClaveDt from "../pages/LOGIN/ClaveDt"
import IngresarCodigo from "../pages/LOGIN/IngresarCodigo"
import Dashboard from "../pages/DASHBOARD/Dashboard"
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperarcontrasena" element={<RecuperarContrasena />} />
        <Route path="/clavedt" element={<ClaveDt />} />
        <Route path="/ingresarcodigo" element={<IngresarCodigo />} />
        <Route path='dashboard' element={<Dashboard></Dashboard>}/>
        <Route path="/" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;