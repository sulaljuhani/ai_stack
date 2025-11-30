#!/usr/bin/env python3
"""
Simple Google Calendar OAuth2 authentication using local server.

This script runs a local HTTP server to catch the OAuth redirect,
making authentication much easier than manual code entry.
"""

import sys
import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import webbrowser
import threading

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/calendar']
CREDENTIALS_PATH = '/app/data/google_credentials.json'
TOKEN_PATH = '/app/data/google_token.json'

# Global variable to store the authorization code
auth_code = None
server_running = True

class CallbackHandler(BaseHTTPRequestHandler):
    """HTTP request handler for OAuth callback."""

    def do_GET(self):
        """Handle GET request from OAuth redirect."""
        global auth_code, server_running

        # Parse the authorization code from the URL
        query = urlparse(self.path).query
        params = parse_qs(query)

        if 'code' in params:
            auth_code = params['code'][0]

            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()

            html = """
            <html>
            <head><title>Authentication Successful</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: green;">✅ Authentication Successful!</h1>
                <p>You can close this window and return to the terminal.</p>
                <p>The authentication process is completing...</p>
            </body>
            </html>
            """
            self.wfile.write(html.encode())

            # Stop the server
            server_running = False
        else:
            # Send error response
            self.send_response(400)
            self.send_header('Content-type', 'text/html')
            self.end_headers()

            html = """
            <html>
            <head><title>Authentication Failed</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: red;">❌ Authentication Failed</h1>
                <p>No authorization code received.</p>
                <p>Please try again.</p>
            </body>
            </html>
            """
            self.wfile.write(html.encode())

    def log_message(self, format, *args):
        """Suppress log messages."""
        pass

def run_server(port=8080):
    """Run local HTTP server to catch OAuth redirect."""
    server = HTTPServer(('localhost', port), CallbackHandler)
    print(f"🌐 Starting local server on http://localhost:{port}")

    while server_running:
        server.handle_request()

    server.server_close()
    print("✅ Server stopped")

def authenticate():
    """Run the OAuth2 authentication flow."""
    print("=" * 70)
    print("Google Calendar OAuth2 Authentication")
    print("=" * 70)

    if not os.path.exists(CREDENTIALS_PATH):
        print(f"\n❌ ERROR: Credentials file not found at {CREDENTIALS_PATH}")
        print("\nPlease download your OAuth2 credentials from Google Cloud Console")
        print("and save them to the path above.")
        return False

    try:
        # Initialize the OAuth flow
        flow = InstalledAppFlow.from_client_secrets_file(
            CREDENTIALS_PATH,
            SCOPES,
            redirect_uri='http://localhost:8080'
        )

        # Generate authorization URL
        auth_url, state = flow.authorization_url(
            prompt='consent',
            access_type='offline',
            include_granted_scopes='true'
        )

        print("\n📋 STEP 1: Opening authorization URL in your browser...")
        print(f"\nIf the browser doesn't open automatically, copy this URL:")
        print(f"\n{auth_url}\n")
        print("=" * 70)

        # Start local server in background thread
        server_thread = threading.Thread(target=run_server, args=(8080,))
        server_thread.daemon = True
        server_thread.start()

        # Open browser (this won't work in Docker, so we print the URL)
        print("\n⏳ Waiting for authorization...")
        print("   (After authorizing, you'll be redirected back automatically)")
        print("\n   If you're running this in Docker, you need to:")
        print("   1. Copy the URL above")
        print("   2. Open it in your browser on your host machine")
        print("   3. Authorize the application")
        print("\n" + "=" * 70)

        # Wait for the server to receive the code
        server_thread.join(timeout=300)  # 5 minute timeout

        if not auth_code:
            print("\n❌ ERROR: No authorization code received")
            print("   The authentication may have timed out or failed.")
            return False

        print("\n📡 Exchanging authorization code for tokens...")

        # Exchange code for credentials
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

        print(f"✅ Token saved to: {TOKEN_PATH}")
        print(f"🔐 Token expires at: {creds.expiry}")
        print("\n" + "=" * 70)
        print("✅ AUTHENTICATION SUCCESSFUL!")
        print("=" * 70)
        print("\n🎉 You can now use Google Calendar sync features!")
        print("\nNext steps:")
        print("1. The sync will run automatically every 15 minutes")
        print("2. Or trigger a manual sync:")
        print("   curl -X POST http://localhost:8000/api/calendar/sync")
        print("\n" + "=" * 70)

        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("\n⚠️  IMPORTANT: This script must be run from the Docker container!")
    print("   The local server will listen on port 8080 inside the container.")
    print("\n")

    success = authenticate()
    sys.exit(0 if success else 1)
