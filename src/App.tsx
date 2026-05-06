import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import AuthGate from './components/AuthGate';
import Layout from './components/Layout';

export default function App() {
  const [key, setKey] = useState(0);

  return (
    <AuthGate onSecretSet={() => setKey((k) => k + 1)}>
      <AppProvider key={key}>
        <Layout />
      </AppProvider>
    </AuthGate>
  );
}
