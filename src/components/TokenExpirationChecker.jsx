import React, { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { renovarToken, logoutApi } from '../services/authService';

export default function TokenExpirationChecker() {
    const isAskingRef = useRef(false);

    useEffect(() => {
        const checkToken = async () => {
            const token = window.localStorage.getItem('token');
            if (!token) return;

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expirationTime = payload.exp * 1000;
                const currentTime = Date.now();
                const timeLeft = expirationTime - currentTime;

                // Si quedan menos de 5 minutos (300,000 ms) y más de 0
                if (timeLeft > 0 && timeLeft < 300000 && !isAskingRef.current) {
                    isAskingRef.current = true;
                    
                    toast((t) => (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: '0 0 10px 0' }}><b>Tu sesión expirará pronto.</b></p>
                            <p style={{ margin: '0 0 15px 0' }}>¿Deseas extender el tiempo de sesión por seguridad?</p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button 
                                    onClick={async () => {
                                        toast.dismiss(t.id);
                                        try {
                                            const respuesta = await renovarToken();
                                            window.localStorage.setItem('token', respuesta.token);
                                            toast.success("¡Sesión extendida exitosamente!");
                                        } catch (error) {
                                            toast.error("No se pudo extender la sesión.");
                                        } finally {
                                            isAskingRef.current = false;
                                        }
                                    }}
                                    style={{ padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Sí, extender
                                </button>
                                <button 
                                    onClick={() => {
                                        toast.dismiss(t.id);
                                        isAskingRef.current = false;
                                    }}
                                    style={{ padding: '8px 16px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Ignorar
                                </button>
                            </div>
                        </div>
                    ), { 
                        duration: 60000, // 1 minuto en pantalla
                        position: 'top-center',
                        style: { minWidth: '350px' }
                    });
                } else if (timeLeft <= 0) {
                    // Hacer la petición al backend para que elimine la sesión activa
                    await logoutApi();
                    
                    // Si el token ya expiró, borrar y mandar al login
                    window.localStorage.removeItem('token');
                    window.location.href = '/login';
                }

            } catch (error) {
                console.error("Error al revisar el token:", error);
            }
        };

        // Revisar cada 1 minuto (60000 ms)
        const intervalId = setInterval(checkToken, 60000);
        checkToken();

        return () => clearInterval(intervalId);
    }, []);

    return null;
}
