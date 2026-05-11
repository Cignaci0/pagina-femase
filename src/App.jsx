// src/App.jsx
import { Toaster } from 'react-hot-toast';
import AppRouter from './router/AppRouter';
import TokenExpirationChecker from './components/TokenExpirationChecker';

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: '16px',
            padding: '16px 24px',
            maxWidth: '500px'
          }
        }}
      />
      <TokenExpirationChecker />
      <AppRouter />
    </>
  );
}

export default App;