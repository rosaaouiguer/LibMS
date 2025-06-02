// services/auth_service.dart - Updated with better token validation
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/student_model.dart';
import 'dart:async';
import '../config/environment.dart';

class AuthService extends ChangeNotifier {
  final String baseUrl = Environment.prodApiUrl;
  
  bool _isAuthenticated = false;
  String? _token; // Store the JWT token
  String? _studentId; // Also store the student ID for convenience
  String? _mongoId;
  Student? _student;
  
  // Updated getters
  bool get isAuthenticated => _isAuthenticated;
  String? get token => _token;
  String? get studentId => _studentId;
  String? get mongoId => _mongoId;
  Student? get student => _student;
  
  // Check if user is already logged in
Future<bool> checkAuthStatus() async {
  final prefs = await SharedPreferences.getInstance();
  final storedToken = prefs.getString('auth_token');
  final storedStudentId = prefs.getString('student_id');
  final storedMongoId = prefs.getString('student_mongo_id');
  
  debugPrint('Checking auth status - Token exists: ${storedToken != null}');
  
  if (storedToken != null && storedStudentId != null && storedMongoId != null) {
    try {
      debugPrint('Validating stored token...');
      // Validate token by using it to access /me endpoint
      final response = await http.get(
        Uri.parse('$baseUrl/student/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $storedToken'
        },
      ).timeout(const Duration(seconds: 10));
      
      debugPrint('Token validation response: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = storedToken;
        _studentId = storedStudentId;
        _mongoId = storedMongoId;
        _student = Student.fromJson(data['data']);
        _isAuthenticated = true;
        notifyListeners();
        debugPrint('Token is valid, user authenticated');
        return true;
      } else {
        // Token invalid, clear stored data
        debugPrint('Token is invalid, clearing stored credentials');
        await logout();
        return false;
      }
    } catch (e) {
      // Error during validation, clear stored data
      debugPrint('Error validating token: $e');
      await logout();
      return false;
    }
  }
  
  debugPrint('No stored credentials found');
  return false;
}
  // Updated login method
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      debugPrint('Attempting login for: $email');
      // Create a HTTP client with timeout
      final client = http.Client();
      debugPrint('Login API URL: $baseUrl');
      final response = await client.post(
        Uri.parse('$baseUrl/student-auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
        }),
      ).timeout(const Duration(seconds: 10));

      final data = json.decode(response.body);
      debugPrint('Login response status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        // Save both token and MongoDB ObjectId to shared preferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', data['token']);
        await prefs.setString('student_id', data['data']['studentId']);
        await prefs.setString('student_mongo_id', data['data']['_id']); // Store MongoDB ObjectId
        
        debugPrint('Credentials saved to SharedPreferences');
        
        // Update state variables
        _token = data['token'];
        _studentId = data['data']['studentId'];
        _mongoId = data['data']['_id']; // Add this property
        _student = Student.fromJson(data['data']);
        _isAuthenticated = true;
        notifyListeners();
        
        return {
          'success': true,
          'message': 'Login successful',
          'student': _student,
        };
      } else if (response.statusCode == 403) {
        // Banned user case
        return {
          'success': false,
          'message': data['error'] ?? 'Your account is banned',
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Login failed',
        };
      }
    } on TimeoutException catch (_) {
      return {
        'success': false,
        'message': 'Request timed out. Please check your connection and try again.',
      };
    } on http.ClientException catch (e) {
      // Handle connection errors
      return {
        'success': false,
        'message': 'Connection error: ${e.message}',
      };
    } catch (e) {
      debugPrint('Login exception: $e');
      return {
        'success': false,
        'message': 'An unexpected error occurred. Please try again.',
      };
    }
  }
  
  // Logout - clear both token and studentId
  Future<void> logout() async {
    debugPrint('Logging out - clearing credentials');
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('student_id');
    await prefs.remove('student_mongo_id');
    
    // Reset state
    _token = null;
    _studentId = null;
    _mongoId = null;
    _student = null;
    _isAuthenticated = false;
    notifyListeners();
  }
  
  // Get headers with auth token
  Map<String, String> getHeaders() {
    final headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization if token exists
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    
    return headers;
  }
}