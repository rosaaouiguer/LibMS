import 'package:flutter/material.dart';

class BookRequest {
  final String id;
  final String title;
  final String author;
  final String status;
  final DateTime requestedAt;
  final String studentId;

  BookRequest({
    required this.id,
    required this.title,
    required this.author,
    required this.status,
    required this.requestedAt,
    required this.studentId,
  });

  factory BookRequest.fromJson(Map<String, dynamic> json) {
    return BookRequest(
      id: json['_id'],
      title: json['title'],
      author: json['author'],
      status: json['status'],
      requestedAt: DateTime.parse(json['requestedAt']),
      studentId: json['studentId'].toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'title': title,
      'author': author,
      'status': status,
      'requestedAt': requestedAt.toIso8601String(),
      'studentId': studentId,
    };
  }
}