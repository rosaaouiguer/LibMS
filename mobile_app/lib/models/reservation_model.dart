// models/reservation_model.dart
class Reservation {
  final String id;
  final String bookId;
  final String studentId;
  final String status; // 'Held', 'Awaiting Pickup', etc.
  final DateTime? availableDate;
  final DateTime? pickupDeadline;
  final DateTime createdAt;
  
  Reservation({
    required this.id,
    required this.bookId,
    required this.studentId,
    required this.status,
    this.availableDate,
    this.pickupDeadline,
    required this.createdAt,
  });
  
  factory Reservation.fromJson(Map<String, dynamic> json) {
    return Reservation(
      id: json['_id'],
      bookId: json['bookId'],
      studentId: json['studentId'],
      status: json['status'],
      availableDate: json['availableDate'] != null ? DateTime.parse(json['availableDate']) : null,
      pickupDeadline: json['pickupDeadline'] != null ? DateTime.parse(json['pickupDeadline']) : null,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}