#!/usr/bin/env python3
"""
Manual Google Calendar OAuth2 authentication.

This generates an authorization URL and accepts the code manually.
"""

import sys
import os
import json

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/calendar']
CREDENTIALS_PATH = '/app/data/google_credentials.json'
TOKEN_PATH = '/app/data/google_token.json'

def main():
    print("=" * 70)
    print("Google Calendar OAuth2 Authentication - Manual Flow")
    print("=" * 70)

    if not os.path.exists(CREDENTIALS_PATH):
        print(f"\n❌ ERROR: Credentials file not found at {CREDENTIALS_PATH}")
        return 1

    try:
        # Initialize the OAuth flow
        flow = InstalledAppFlow.from_client_secrets_file(
            CREDENTIALS_PATH,
            SCOPES
        )

        # Use localhost redirect
        flow.redirect_uri = 'http://localhost'

        # Generate authorization URL
        auth_url, state = flow.authorization_url(
            prompt='consent',
            access_type='offline',
            include_granted_scopes='true'
        )

        print("\n📋 AUTHORIZATION URL:")
        print(auth_url)
        print("\n" + "=" * 70)
        print("INSTRUCTIONS:")
        print("=" * 70)
        print("1. Copy the URL above")
        print("2. Open it in your browser")
        print("3. Sign in and authorize the application")
        print("4. You'll be redirected to a URL like:")
        print("   http://localhost/?state=xxx&code=4/0AeanRRrv...&scope=...")
        print("5. Copy the FULL URL from your browser's address bar")
        print("=" * 70)

        redirect_url = input("\nPaste the full redirect URL here: ").strip()

        if not redirect_url:
            print("\n❌ ERROR: No URL provided")
            return 1

        # Extract the code from the URL
        from urllib.parse import urlparse, parse_qs

        parsed = urlparse(redirect_url)
        params = parse_qs(parsed.query)

        if 'code' not in params:
            print("\n❌ ERROR: No authorization code found in URL")
            print(f"   Received URL: {redirect_url}")
            return 1

        auth_code = params['code'][0]
        print(f"\n✅ Found authorization code: {auth_code[:20]}...")

        # Exchange code for credentials
        print("\n📡 Exchanging authorization code for tokens...")

        # Disable scope validation to handle extra scopes from Google
        os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

        flow.fetch_token(code=auth_code)
        creds = flow.credentials

        # Save credentials
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

        print(f"\n✅ Token saved to: {TOKEN_PATH}")
        print(f"🔐 Token expires at: {creds.expiry}")
        print("\n" + "=" * 70)
        print("✅ AUTHENTICATION SUCCESSFUL!")
        print("=" * 70)
        print("\n🎉 You can now use Google Calendar sync features!")
        print("\nNext steps:")
        print("1. The sync will run automatically every 15 minutes")
        print("2. Or trigger a manual sync:")
        print("   docker exec langgraph-agents python3 -c \"")
        print("   import asyncio")
        print("   from services.external_sync import sync_google_calendar")
        print("   asyncio.run(sync_google_calendar())")
        print("   \"")
        print("\n" + "=" * 70)

        return 0

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
