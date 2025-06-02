// services/student_service.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../models/student_model.dart';
import 'auth_service.dart';
import '../config/environment.dart';

class StudentService {
  final String baseUrl = Environment.prodApiUrl;
  final AuthService _authService;
  
  StudentService(this._authService);

  // Get current student with debug prints
  Future<Student> getCurrentStudent() async {
    // Get authentication headers
    final headers = _authService.getHeaders();
    debugPrint('getCurrentStudent - Headers: $headers');
    
    // Print the full URL being accessed - now using /me endpoint
    final url = '$baseUrl/student/me';
    debugPrint('getCurrentStudent - URL: $url');
    
    try {
      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      );

      // Print response status and body for debugging
      debugPrint('getCurrentStudent - Response Status: ${response.statusCode}');
      debugPrint('getCurrentStudent - Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        debugPrint('getCurrentStudent - Parsed Data: $data');
        return Student.fromJson(data['data']);
      } else {
        // Print detailed error information
        debugPrint('getCurrentStudent - Error: ${response.body}');
        throw Exception('Failed to load student: ${response.statusCode}, ${response.body}');
      }
    } catch (e) {
      // Print any exceptions that occur
      debugPrint('getCurrentStudent - Exception: $e');
      rethrow;
    }
  }

  // Get a student by ID - this doesn't need to change much as it already uses ID
  Future<Student> getStudentById(String id) async {
    final headers = _authService.getHeaders();
    
    final response = await http.get(
      Uri.parse('$baseUrl/student/$id'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Student.fromJson(data['data']);
    } else {
      throw Exception('Failed to load student: ${response.statusCode}');
    }
  }

  // Update student details
  Future<Student> updateStudent(String id, Map<String, dynamic> data) async {
    final headers = _authService.getHeaders();
    
    final response = await http.put(
      Uri.parse('$baseUrl/student/$id'),
      headers: headers,
      body: json.encode(data),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      return Student.fromJson(responseData['data']);
    } else {
      throw Exception('Failed to update student: ${response.statusCode}');
    }
  }

  // Update student profile image
  Future<Student> updateStudentImage(String id, String imagePath) async {
    var request = http.MultipartRequest(
      'PUT',
      Uri.parse('$baseUrl/student/$id'),
    );
    
    // Add authentication headers if needed
    final authHeaders = _authService.getHeaders();
    // Remove Content-Type as it will be set by the multipart request
    authHeaders.remove('Content-Type');
    request.headers.addAll(authHeaders);

    request.files.add(await http.MultipartFile.fromPath('image', imagePath));

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Student.fromJson(data['data']);
    } else {
      throw Exception('Failed to update image: ${response.statusCode}');
    }
  }


  Future<bool> changePassword(String id, String currentPassword, String newPassword) async {
  final headers = _authService.getHeaders();
  
  final response = await http.put(
    Uri.parse('$baseUrl/student/change-password/$id'),
    headers: headers,
    body: json.encode({
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    }),
  );

  if (response.statusCode == 200) {
    return true;
  } else {
    final data = json.decode(response.body);
    throw Exception(data['error'] ?? 'Failed to change password');
  }
}
}