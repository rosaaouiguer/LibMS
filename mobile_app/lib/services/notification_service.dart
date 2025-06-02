// services/notification_service.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../models/notification_model.dart';
import 'auth_service.dart';
import '../config/environment.dart';

class NotificationService {
  final String baseUrl = Environment.prodApiUrl;
  AuthService? _authService;
  bool get isInitialized => _authService != null;

  NotificationService();

  void initialize(AuthService authService) {
    _authService = authService;
  }

  // Helper method to check initialization
  void _checkInitialization() {
    if (_authService == null) {
      throw Exception('NotificationService not initialized. Call initialize() first.');
    }
  }

  // Get notifications for a student
  Future<List<AppNotification>> getNotifications(String studentId) async {
    _checkInitialization();
    
    // Get authentication headers
    final headers = _authService!.getHeaders();
    debugPrint('getNotifications - Headers: $headers');
    
    // Use the correct URL with query parameter
    final url = '$baseUrl/notifications?studentId=$studentId';
    debugPrint('getNotifications - URL: $url');
    
    try {
      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      );

      // Print response status and body for debugging
      debugPrint('getNotifications - Response Status: ${response.statusCode}');
      debugPrint('getNotifications - Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> notificationsJson = data['data'];
        
        return notificationsJson
            .map((json) => AppNotification.fromJson(json))
            .toList();
      } else {
        debugPrint('getNotifications - Error: ${response.body}');
        throw Exception('Failed to load notifications: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('getNotifications - Exception: $e');
      rethrow;
    }
  }

  // Get unread notification count
  Future<int> getUnreadCount(String studentId) async {
    _checkInitialization();
    
    final headers = _authService!.getHeaders();
    
    final url = '$baseUrl/notifications/unread/count?studentId=$studentId';
    
    try {
      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['count'];
      } else {
        throw Exception('Failed to load unread count: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('getUnreadCount - Exception: $e');
      rethrow;
    }
  }

  // Mark a notification as read
  Future<void> markAsRead(String notificationId) async {
    _checkInitialization();
    
    final headers = _authService!.getHeaders();
    
    final url = '$baseUrl/notifications/$notificationId/read';
    
    try {
      final response = await http.put(
        Uri.parse(url),
        headers: headers,
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to mark as read: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('markAsRead - Exception: $e');
      rethrow;
    }
  }

  // Mark all notifications as read
  Future<void> markAllAsRead(String studentId) async {
    _checkInitialization();
    
    final headers = _authService!.getHeaders();
    headers['Content-Type'] = 'application/json';
    
    final url = '$baseUrl/notifications/read-all';
    
    try {
      final response = await http.put(
        Uri.parse(url),
        headers: headers,
        body: json.encode({'studentId': studentId}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to mark all as read: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('markAllAsRead - Exception: $e');
      rethrow;
    }
  }
}