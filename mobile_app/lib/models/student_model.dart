// models/student_model.dart
class StudentCategory {
  final String id;
  final String name;
  final String description;
  final int borrowingLimit;
  final int loanDuration;
  final bool loanExtensionAllowed;
  final int extensionLimit;
  final int extensionDuration;

  StudentCategory({
    required this.id,
    required this.name,
    required this.description,
    required this.borrowingLimit,
    required this.loanDuration,
    required this.loanExtensionAllowed,
    required this.extensionLimit,
    required this.extensionDuration,
  });

  factory StudentCategory.fromJson(Map<String, dynamic> json) {
    return StudentCategory(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      borrowingLimit: json['borrowingLimit'] ?? 0,
      loanDuration: json['loanDuration'] ?? 0,
      loanExtensionAllowed: json['loanExtensionAllowed'] ?? false,
      extensionLimit: json['extensionLimit'] ?? 0,
      extensionDuration: json['extensionDuration'] ?? 0,
    );
  }
}

class Student {
  final String id;
  final String name;
  final String studentId;
  final String email;
  final DateTime dateOfBirth;
  final String image;
  final String phoneNumber;
  final StudentCategory category;
  final bool banned;
  final DateTime? bannedUntil;

  Student({
    required this.id,
    required this.name,
    required this.studentId,
    required this.email,
    required this.dateOfBirth,
    required this.image,
    required this.phoneNumber,
    required this.category,
    required this.banned,
    this.bannedUntil,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      studentId: json['studentId'] ?? '',
      email: json['email'] ?? '',
      dateOfBirth: json['dateOfBirth'] != null 
        ? DateTime.parse(json['dateOfBirth']) 
        : DateTime.now(),
      image: json['image'] ?? 'assets/defaultItemPic.png',
      phoneNumber: json['phoneNumber'] ?? '',
      category: json['category'] != null 
        ? StudentCategory.fromJson(json['category']) 
        : StudentCategory(
            id: '',
            name: '',
            description: '',
            borrowingLimit: 0,
            loanDuration: 0,
            loanExtensionAllowed: false,
            extensionLimit: 0,
            extensionDuration: 0,
          ),
      banned: json['banned'] ?? false,
      bannedUntil: json['bannedUntil'] != null 
        ? DateTime.parse(json['bannedUntil']) 
        : null,
    );
  }
}