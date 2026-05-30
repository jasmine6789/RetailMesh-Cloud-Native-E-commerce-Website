# @ecommerce-platform/auth-provider

JWT authentication provider for ecommerce micro-frontends. Integrates with **Identity.API** via the Ocelot gateway (`/auth/login`, `/auth/me`).

## Usage

```tsx
import { EcommerceAuthProvider, useAuth } from '@ecommerce-platform/auth-provider';

const authApiUrl = 'http://127.0.0.1:8010/auth';

function App() {
  return (
    <EcommerceAuthProvider authApiUrl={authApiUrl}>
      <YourApp />
    </EcommerceAuthProvider>
  );
}

// Login page
const { login } = useAuth();
await login({ email: 'demo@retailmesh.com', password: 'Demo@12345' });
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `authApiUrl` | `string` | Yes | Gateway auth base URL (e.g. `http://localhost:8010/auth`) |
| `debug` | `DebugOptions` | No | Preset token, auto-login for mock mode |

## Mock / dev mode

```tsx
<EcommerceAuthProvider
  authApiUrl={authApiUrl}
  debug={{
    logging: true,
    autoLogin: true,
    autoLoginCredentials: { email: 'demo@retailmesh.com', password: 'Demo@12345' },
  }}
/>
```

Tokens are stored under `ecommerce-auth-token` and broadcast to remote MFEs via `broadcastToken`.
