import React from 'react';
import { useKeycloak } from './hooks/useKeycloak';
import { Navigate, useNavigate } from 'react-router';

interface PrivateRouteProps{
    roles: string[];
    children: React.ReactNode;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ roles, children }) => {
    const navigate = useNavigate();
    const { keycloak, authenticated } = useKeycloak();
    if (!keycloak) {
        // Keycloak is not initialized yet, return null or a loading spinner
        return <div>Loading...</div>;
    }

    if (!authenticated) {
        // Redirect to the login page if not authenticated
        keycloak.login({
            redirectUri: window.location.href,
        });
        return null; // Prevent rendering while redirecting
    }

    // Check if token is expired
    if (keycloak.isTokenExpired()) {
        // Refresh the token if expired
        keycloak.updateToken(30).then(() => {
            // Token refreshed, do nothing
        }).catch(() => {
            // Token refresh failed, redirect to login
            keycloak.login({
                redirectUri: window.location.href,
            });
            return null; // Prevent rendering while redirecting
        });
    }

    // Check if the user has the required roles
    if (roles.length === 0) {
        // No roles required, render the children
        return <>{children}</>;
    }
    const hasRequiredRoles = roles.some(role => keycloak.hasRealmRole(role));
    if (!hasRequiredRoles) {
        // Redirect to the unauthorized page if the user does not have the required roles
        navigate('/');
        return null; // Prevent rendering while redirecting
    }
    // Check if the user has the required roles

    // Render the children if authorized
    return <>{children}</>;
}

export default PrivateRoute;