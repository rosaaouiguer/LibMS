// models/notification_model.dart
class AppNotification {
  final String id;
  final String student;
  final String message;
  final String category;
  final bool read;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.student,
    required this.message,
    required this.category,
    required this.read,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['_id'],
      student: json['student'],
      message: json['message'],
      category: json['category'],
      read: json['read'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'student': student,
      'message': message,
      'category': category,
      'read': read,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}