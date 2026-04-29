import React, { useState, useRef } from "react";
import {
    Box, Paper, TextField, Button, IconButton, Typography, Stack, InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import FingerprintIcon from '@mui/icons-material/Fingerprint';

const PinRow = ({ label, value, onChange, showVisibility = false, isVisible = true, onToggleVisibility }) => {
    const inputs = useRef([]);

    const handleInputChange = (index, e) => {
        const val = e.target.value;
        if (val.length <= 1 && /^\d*$/.test(val)) {
            const newValue = [...value];
            newValue[index] = val;
            onChange(newValue);

            // Move to next input if digit entered
            if (val && index < 3) {
                inputs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    return (
        <Box sx={{ width: '100%', mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mb: 1.5, fontWeight: 500, color: 'text.secondary', textAlign: 'center' }}>
                {label}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                {value.map((digit, index) => (
                    <TextField
                        key={index}
                        inputRef={(el) => (inputs.current[index] = el)}
                        value={digit}
                        onChange={(e) => handleInputChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        type={isVisible ? "text" : "password"}
                        variant="outlined"
                        autoComplete="off"
                        inputProps={{
                            maxLength: 1,
                            style: { textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }
                        }}
                        sx={{
                            width: 55,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'rgba(0,0,0,0.02)',
                                '&:hover fieldset': { borderColor: 'primary.main' },
                            }
                        }}
                    />
                ))}
                {showVisibility && (
                    <IconButton onClick={onToggleVisibility} sx={{ ml: 1 }}>
                        {isVisible ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                )}
            </Stack>
        </Box>
    );
};

function AdminCambiarpinFirma() {
    const [currentPin, setCurrentPin] = useState(["", "", "", ""]);
    const [newPin, setNewPin] = useState(["", "", "", ""]);
    const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSave = () => {
        console.log("Saving PIN...", {
            current: currentPin.join(""),
            new: newPin.join(""),
            confirm: confirmPin.join("")
        });
    };

    return (
        <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FingerprintIcon fontSize="large" color="primary" />
                    Cambiar Pin de Firma
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={3} sx={{
                p: 5,
                bgcolor: "#FFFFFD",
                borderRadius: 4,
                width: "100%",
                maxWidth: 600,
                margin: "0 auto",
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <Box sx={{ width: '100%', maxWidth: 350 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <PinRow
                            label="Introduzca su Pin actual"
                            value={currentPin}
                            onChange={setCurrentPin}
                            showVisibility={true}
                            isVisible={showCurrent}
                            onToggleVisibility={() => setShowCurrent(!showCurrent)}
                        />
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                        <PinRow
                            label="Introduzca su nuevo Pin"
                            value={newPin}
                            onChange={setNewPin}
                            showVisibility={true}
                            isVisible={showNew}
                            onToggleVisibility={() => setShowNew(!showNew)}
                        />
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                        <PinRow
                            label="Repita su nuevo Pin"
                            value={confirmPin}
                            onChange={setConfirmPin}
                            showVisibility={true}
                            isVisible={showConfirm}
                            onToggleVisibility={() => setShowConfirm(!showConfirm)}
                        />
                    </Box>

                    <Box sx={{ pt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSave}
                            disabled={
                                currentPin.includes("") ||
                                newPin.includes("") ||
                                confirmPin.includes("")
                            }
                            sx={{
                                px: 6,
                                py: 1.5,
                                borderRadius: 3,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(0,118,255,0.23)',
                                }
                            }}
                        >
                            Guardar Pin
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default AdminCambiarpinFirma;