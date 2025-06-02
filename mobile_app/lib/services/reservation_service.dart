// services/reservation_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import '../models/reservation_model.dart';
import 'auth_service.dart';
import '../config/environment.dart';

class ReservationService {
  final String baseUrl = Environment.prodApiUrl;
  final AuthService _authService;
  
  ReservationService(this._authService);
  
  // Create a new reservation
  Future<Map<String, dynamic>> createReservation(String bookId, {int daysUntilExpiry = 3}) async {
    try {
      final headers = _authService.getHeaders();
      final studentId = _authService.mongoId;
      
      if (studentId == null) {
        return {
          'success': false,
          'message': 'User is not authenticated'
        };
      }
      
      final response = await http.post(
        Uri.parse('$baseUrl/reservations'),
        headers: headers,
        body: json.encode({
          'bookId': bookId,
          'studentId': studentId,
          'daysUntilExpiry': daysUntilExpiry
        }),
      );
      
      final data = json.decode(response.body);
      
      debugPrint('Reservation response: ${response.statusCode}, ${response.body}');
      
      if (response.statusCode == 201) {
        return {
          'success': true,
          'message': data['message'] ?? 'Reservation successful',
          'data': data['data']
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to create reservation'
        };
      }
    } catch (e) {
      debugPrint('Error creating reservation: $e');
      return {
        'success': false,
        'message': 'An error occurred while processing your request'
      };
    }
  }

  Future<Map<String, dynamic>> cancelReservation(String reservationId) async {
  try {
    final headers = _authService.getHeaders();
    
    final response = await http.put(
      Uri.parse('$baseUrl/reservations/$reservationId/cancel'),
      headers: headers,
    );
    
    final data = json.decode(response.body);
    
    debugPrint('Cancel reservation response: ${response.statusCode}, ${response.body}');
    
    if (response.statusCode == 200) {
      return {
        'success': true,
        'message': data['message'] ?? 'Reservation cancelled successfully',
        'data': data['data']
      };
    } else {
      return {
        'success': false,
        'message': data['message'] ?? 'Failed to cancel reservation'
      };
    }
  } catch (e) {
    debugPrint('Error cancelling reservation: $e');
    return {
      'success': false,
      'message': 'An error occurred while processing your request'
    };
  }
}

}