#!/usr/bin/env python3
"""
Complete Google OAuth2 authentication flow.

Usage:
    python3 complete_google_auth.py <authorization_code>
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from google_auth_oauthlib.flow import InstalledAppFlow
from services.google_auth import GoogleCalendarAuth, SCOPES, CREDENTIALS_PATH, TOKEN_PATH
import json

def complete_auth(auth_code: str):
    """Complete the OAuth2 flow with the authorization code."""

    print("=" * 60)
    print("Completing Google Calendar OAuth2 authentication...")
    print("=" * 60)

    try:
        # Initialize the flow
        flow = InstalledAppFlow.from_client_secrets_file(
            CREDENTIALS_PATH,
            SCOPES
        )

        # Set redirect URI to out-of-band (OOB) flow
        flow.redirect_uri = 'urn:ietf:wg:oauth:2.0:oob'

        # Exchange authorization code for credentials
        print("\n📡 Exchanging authorization code for access token...")
        flow.fetch_token(code=auth_code)
        creds = flow.credentials

        # Save the credentials
        print("💾 Saving credentials...")
        token_data = {
            'token': creds.token,
            'refresh_token': creds.refresh_token,
            'token_uri': creds.token_uri,
            'client_id': creds.client_id,
            'client_secret': creds.client_secret,
            'scopes': creds.scopes
        }

        with open(TOKEN_PATH, 'w') as token_file:
            json.dump(token_data, token_file, indent=4)

        print(f"✅ Token saved to: {TOKEN_PATH}")
        print(f"🔐 Token expires at: {creds.expiry}")
        print("\n" + "=" * 60)
        print("✅ AUTHENTICATION SUCCESSFUL!")
        print("=" * 60)
        print("\nYou can now use the Google Calendar sync features.")
        print("\nNext steps:")
        print("1. Restart the langgraph-agents container:")
        print("   docker restart langgraph-agents")
        print("\n2. Trigger a manual sync:")
        print("   curl -X POST http://localhost:8000/api/calendar/sync")
        print("\n3. The scheduler will also sync every 15 minutes automatically.")
        print("=" * 60)

        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\nTroubleshooting:")
        print("- Make sure you copied the full authorization code")
        print("- The code should start with '4/0A...'")
        print("- Make sure you didn't include extra characters")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 complete_google_auth.py <authorization_code>")
        print("\nExample:")
        print("  python3 complete_google_auth.py '4/0AanRRrv...'")
        sys.exit(1)

    auth_code = sys.argv[1]
    success = complete_auth(auth_code)
    sys.exit(0 if success else 1)
