import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/library_rule_model.dart';
import '../services/auth_service.dart';
import '../config/environment.dart';


class LibraryRuleService {
  final AuthService _authService;
    final String baseUrl = Environment.prodApiUrl;

  LibraryRuleService(this._authService);

  Future<List<LibraryRule>> getAllRules() async {
    final token = await _authService.getHeaders();
    if (token == null) {
      throw Exception('Not authenticated');
    }

    final response = await http.get(
      Uri.parse('$baseUrl/libraryrules'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      List<dynamic> rulesJson = json.decode(response.body);
      return rulesJson.map((rule) => LibraryRule.fromJson(rule)).toList();
    } else {
      throw Exception('Failed to load library rules: ${response.body}');
    }
  }

  Future<LibraryRule> getRuleById(String id) async {
    final token = await _authService.getHeaders();
    if (token == null) {
      throw Exception('Not authenticated');
    }

    final response = await http.get(
      Uri.parse('$baseUrl/libraryrules/$id'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return LibraryRule.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load rule: ${response.body}');
    }
  }
}