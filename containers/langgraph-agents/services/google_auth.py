"""
Handles Google OAuth2 authentication for calendar access.

- Manages token storage (local file)
- Handles interactive and non-interactive auth flows
- Refreshes expired tokens
"""

import os
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from typing import Optional

from utils.logging import get_logger

logger = get_logger(__name__)

# Scopes for Google Calendar API (read/write)
SCOPES = ['https://www.googleapis.com/auth/calendar']
TOKEN_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'google_token.json')
CREDENTIALS_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'google_credentials.json')


class GoogleCalendarAuth:
    """Manages Google OAuth2 authentication and token persistence."""

    def __init__(self, token_path: str = TOKEN_PATH, credentials_path: str = CREDENTIALS_PATH):
        """
        Initializes the auth manager.

        Args:
            token_path: Path to the stored token file.
            credentials_path: Path to the Google Cloud credentials file.
        """
        self.token_path = token_path
        self.credentials_path = credentials_path
        self._ensure_data_directory()

    def _ensure_data_directory(self):
        """Ensures the directory for storing token/credentials exists."""
        data_dir = os.path.dirname(self.token_path)
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
            logger.info(f"Created data directory: {data_dir}")

    def authenticate(self) -> Optional[Credentials]:
        """
        Authenticates with Google, handling token loading, refreshing, and creation.

        Returns:
            Google OAuth2 credentials if successful, otherwise None.
        """
        creds = self._load_credentials()

        # If credentials exist and are invalid, refresh them
        if creds and creds.expired and creds.refresh_token:
            try:
                logger.info("Google token has expired. Refreshing...")
                creds.refresh(Request())
                self._save_credentials(creds)
                logger.info("Token refreshed and saved successfully.")
            except Exception as e:
                logger.error(f"Failed to refresh token: {e}", exc_info=True)
                # If refresh fails, force re-authentication
                creds = self._run_interactive_flow()

        # If no valid credentials, run the interactive auth flow
        elif not creds:
            creds = self._run_interactive_flow()

        return creds

    def _load_credentials(self) -> Optional[Credentials]:
        """Loads credentials from the token file."""
        if os.path.exists(self.token_path):
            try:
                with open(self.token_path, 'r') as token_file:
                    token_data = json.load(token_file)
                return Credentials.from_authorized_user_info(token_data, SCOPES)
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Error loading token file: {e}. Re-authentication is needed.", exc_info=True)
                return None
        return None

    def _save_credentials(self, creds: Credentials):
        """Saves credentials to the token file."""
        token_data = {
            'token': creds.token,
            'refresh_token': creds.refresh_token,
            'token_uri': creds.token_uri,
            'client_id': creds.client_id,
            'client_secret': creds.client_secret,
            'scopes': creds.scopes
        }
        with open(self.token_path, 'w') as token_file:
            json.dump(token_data, token_file, indent=4)
        logger.info(f"Credentials saved to {self.token_path}")

    def _run_interactive_flow(self) -> Optional[Credentials]:
        """
        Runs the interactive OAuth2 flow to get new credentials.
        This requires user interaction in a browser.
        """
        if not os.path.exists(self.credentials_path):
            logger.critical(
                f"Google credentials file not found at '{self.credentials_path}'. "
                "Please download it from Google Cloud Console and place it there."
            )
            return None

        try:
            flow = InstalledAppFlow.from_client_secrets_file(self.credentials_path, SCOPES)

            # Use out-of-band (OOB) flow with proper redirect_uri
            flow.redirect_uri = 'urn:ietf:wg:oauth:2.0:oob'

            auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline')
            print(f"Please go to this URL and authorize access: {auth_url}")
            code = input("Enter the authorization code: ")
            flow.fetch_token(code=code)
            creds = flow.credentials

            self._save_credentials(creds)
            logger.info("Interactive authentication successful.")
            return creds
        except Exception as e:
            logger.error(f"Interactive authentication flow failed: {e}", exc_info=True)
            return None

# Example usage (for testing)
if __name__ == '__main__':
    print("Running Google Calendar authentication...")
    auth = GoogleCalendarAuth()
    credentials = auth.authenticate()
    if credentials:
        print("Authentication successful!")
        print(f"Token valid until: {credentials.expiry}")
    else:
        print("Authentication failed. Check logs for details.")
