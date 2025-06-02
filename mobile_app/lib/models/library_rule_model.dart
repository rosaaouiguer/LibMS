class LibraryRule {
  final String id;
  final String title;
  final String description;
  final String? penalty;
  final DateTime createdAt;
  final DateTime updatedAt;

  LibraryRule({
    required this.id,
    required this.title,
    required this.description,
    this.penalty,
    required this.createdAt,
    required this.updatedAt,
  });

  factory LibraryRule.fromJson(Map<String, dynamic> json) {
    return LibraryRule(
      id: json['_id'],
      title: json['title'],
      description: json['description'],
      penalty: json['penalty'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'title': title,
      'description': description,
      'penalty': penalty,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}