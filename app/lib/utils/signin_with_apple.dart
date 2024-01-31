import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// [signInWithApple] performs Apple sign in on iOS and macOS.
/// See https://supabase.com/docs/guides/auth/social-login/auth-apple?platform=flutter#using-native-sign-in-with-apple-in-flutter
Future<AuthResponse> signInWithApple() async {
  final rawNonce = Supabase.instance.client.auth.generateRawNonce();
  final hashedNonce = sha256.convert(utf8.encode(rawNonce)).toString();

  final credential = await SignInWithApple.getAppleIDCredential(
    scopes: [
      AppleIDAuthorizationScopes.email,
      AppleIDAuthorizationScopes.fullName,
    ],
    nonce: hashedNonce,
  );

  final idToken = credential.identityToken;
  if (idToken == null) {
    throw const AuthException(
      'Could not find ID Token from generated credential.',
    );
  }

  return Supabase.instance.client.auth.signInWithIdToken(
    provider: OAuthProvider.apple,
    idToken: idToken,
    nonce: rawNonce,
  );
}
