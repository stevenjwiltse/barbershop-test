from fastapi import Depends, HTTPException, status, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.models import TokenResponse, UserInfo
from auth.service import AuthService

# Initialize HTTPBearer security dependency
bearer_scheme = HTTPBearer()


class AuthController:
    """
    Controller for handling authentication logic.
    """

    def login(username: str = Form(...), password: str = Form(...)) -> TokenResponse:
        """
        Authenticate user and return access token.

        Args:
            username (str): The username of the user attempting to log in.
            password (str): The password of the user.

        Raises:
            HTTPException: If the authentication fails (wrong credentials).

        Returns:
            TokenResponse: Contains the access token upon successful authentication.
        """
        # Authenticate the user using the AuthService
        access_token = AuthService.authenticate_user(username, password)

        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        return TokenResponse(access_token=access_token)

    def protected_endpoint(
        credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
        required_role: str = None  # Optional parameter to enforce role-based access
    ) -> UserInfo:
        """
        Access a protected resource that requires valid token authentication.

        Args:
            credentials (HTTPAuthorizationCredentials): Bearer token provided via HTTP Authorization header.

        Raises:
            HTTPException: If the token is invalid or not provided.

        Returns:
            UserInfo: Information about the authenticated user.
        """
        # Extract the bearer token from the provided credentials
        token = credentials.credentials

        # Verify the token and get user information
        user_info = AuthService.verify_token(token)

        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # If a role is required, enforce role-based access
        if required_role and required_role not in user_info.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"***Access denied. Requires '{required_role}'.",
        )
        return user_info
    

    