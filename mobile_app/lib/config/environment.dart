// config/environment.dart
import 'package:flutter/foundation.dart';

class Environment {
  // Production URL - your Render hosted backend
  static const String prodApiUrl = 'https://lms-backend-zjt1.onrender.com/api';
  
  // Development URL - your local server
  static const String devApiUrl = 'http://192.168.1.74:5000/api';
  
  // Choose which URL to use based on environment
  static String get apiUrl {
    // In a real production app, you might want a more sophisticated way to determine this
    // For example, using build-time environment variables or Flutter's flavor system
    if (kReleaseMode) {
      // Use production URL for release builds
      return prodApiUrl;
    } else {
      // Use development URL for debug builds
      return devApiUrl;
    }
  }
}