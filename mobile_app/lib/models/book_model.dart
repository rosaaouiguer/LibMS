// lib/models/book.dart

class Book {
  final String id;
  final String title;
  final String author;
  final String? imageURL;
  final String? summary;
  final String? keywords;
  final String? barcode;
  final String? ebookLink;
  final int totalCopies;
  final int availableCopies;

  Book({
    required this.id,
    required this.title,
    required this.author,
    this.imageURL,
    this.summary,
    this.keywords,
    this.barcode,
    this.ebookLink,
    required this.totalCopies,
    required this.availableCopies,
  });

  factory Book.fromJson(Map<String, dynamic> json) {
    return Book(
      id: json['_id'],
      title: json['title'],
      author: json['author'],
      imageURL: json['imageURL'],
      summary: json['summary'],
      keywords: json['keywords'],
      barcode: json['barcode'],
      ebookLink: json['ebookLink'],
      totalCopies: json['totalCopies'],
      availableCopies: json['availableCopies'],
    );
  }
}