import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../models/book_request_model.dart';
import 'auth_service.dart';
import '../config/environment.dart';

class BookRequestService {
  final String baseUrl = Environment.prodApiUrl;
  final AuthService _authService;
  
  BookRequestService(this._authService);

  // Get all book requests for a student
  Future<List<BookRequest>> getStudentBookRequests(String studentId) async {
    final headers = _authService.getHeaders();
    
    final response = await http.get(
      Uri.parse('$baseUrl/bookrequests/student/$studentId'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      
      return (data['data'] as List)
          .map((item) => BookRequest.fromJson(item))
          .toList();
    } else {
      throw Exception('Failed to load book requests: ${response.statusCode}');
    }
  }

  // Create a new book request
  Future<BookRequest> createBookRequest(Map<String, dynamic> requestData) async {
    final headers = _authService.getHeaders();
    
    final response = await http.post(
      Uri.parse('$baseUrl/bookrequests'),
      headers: headers,
      body: json.encode(requestData),
    );

    if (response.statusCode == 201) {
      final data = json.decode(response.body);
      return BookRequest.fromJson(data['data']);
    } else {
      throw Exception('Failed to create book request: ${response.statusCode}');
    }
  }

  // Get book requests by status
  Future<List<BookRequest>> getBookRequestsByStatus(String status) async {
    final headers = _authService.getHeaders();
    
    final response = await http.get(
      Uri.parse('$baseUrl/bookrequests/status/$status'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      
      return (data['data'] as List)
          .map((item) => BookRequest.fromJson(item))
          .toList();
    } else {
      throw Exception('Failed to load book requests: ${response.statusCode}');
    }
  }
}