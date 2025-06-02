import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'book_detail_page.dart';
import '../models/book_model.dart'; // Import the shared Book model
import 'dart:convert';

class CatalogPage extends StatefulWidget {
  const CatalogPage({Key? key}) : super(key: key);

  @override
  State<CatalogPage> createState() => _CatalogPageState();
}

class _CatalogPageState extends State<CatalogPage> {
  List<Book> _books = [];
  List<Book> _filteredBooks = [];
  bool _isLoading = true;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  
  // Define our new color palette
  final Color primaryColor = const Color(0xFF0C1F47); // Blue
  final Color accentColor = const Color(0xFFF37D00); // Orange
  final Color secondaryColor = const Color(0xFF9FADFD); // Light Violet
  final Color backgroundColor = const Color(0xFFF2F3F4); // Antiwhite
  final Color textColor = const Color(0xFF0C1F47); // Using blue as text color
  final Color cardColor = Colors.white;
  
  @override
  void initState() {
    super.initState();
    _fetchBooks();
    
    _searchController.addListener(() {
      _filterBooks(_searchController.text);
    });
  }
  
  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

Future<void> _fetchBooks() async {
  if (!mounted) return; // Check if widget is still mounted before proceeding
  
  setState(() {
    _isLoading = true;
  });
  
  try {
    // Update your MongoDB API endpoint here
    final response = await http.get(Uri.parse('https://lms-backend-zjt1.onrender.com/api/books'));
    
    if (!mounted) return; // Check again after the network request
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List<dynamic> booksJson = data['data'];
      
      if (mounted) { // Check before setting state
        setState(() {
          _books = booksJson.map((json) => Book.fromJson(json)).toList();
          _filteredBooks = List.from(_books);
          _isLoading = false;
        });
      }
    } else {
      // Handle error
      if (mounted) { // Check before setting state
        setState(() {
          _isLoading = false;
        });
        _showErrorSnackBar('Failed to load books. Please try again.');
      }
      
      // Load mock data as fallback
      if (mounted) {
        _loadMockData();
      }
    }
  } catch (e) {
    print('Error fetching books: $e'); // Debugging
    
    if (!mounted) return; // Check if still mounted before setting state
    
    setState(() {
      _isLoading = false;
    });
    _showErrorSnackBar('Network error. Please check your connection.');
    
    // Load mock data as fallback
    _loadMockData();
  }
}
  
  ImageProvider _getBookImage(Book book) {
  if (book.imageURL == null || book.imageURL!.isEmpty) {
    return const AssetImage('assets/defaultItemPic.png');
  }
  
  // Handle data URLs (base64 encoded images)
  if (book.imageURL!.startsWith('data:')) {
    try {
      // Extract the base64 part from data URL
      final uri = Uri.parse(book.imageURL!);
      
      // For data URLs, we need to handle it differently
      final regex = RegExp(r'data:image/[^;]+;base64,(.*)');
      final match = regex.firstMatch(book.imageURL!);
      
      if (match != null && match.groupCount >= 1) {
        final base64String = match.group(1)!;
        return MemoryImage(base64Decode(base64String));
      }
    } catch (e) {
      print('Error parsing image data URL: $e');
    }
    
    // Fallback to default image if parsing fails
    return const AssetImage('assets/defaultItemPic.png');
  }
  
  // Handle HTTP URLs
  return NetworkImage(book.imageURL!);
}

  void _loadMockData() {
    if (!mounted) return;
    _books = [
      Book(
        id: '1',
        title: 'The Kite Runner',
        author: 'Khaled Hosseini',
        summary: 'The unforgettable story of friendship between two boys growing up in Afghanistan.',
        keywords: 'fiction, drama, friendship',
        totalCopies: 5,
        availableCopies: 3,
      ),
      Book(
        id: '2',
        title: 'The Subtle Art of Not Giving a F*ck',
        author: 'Mark Manson',
        summary: 'A counterintuitive approach to living a good life.',
        keywords: 'self-help, psychology, mindfulness',
        totalCopies: 8,
        availableCopies: 2,
      ),
      Book(
        id: '3',
        title: 'The Art of War',
        author: 'Sun Tzu',
        summary: 'An ancient Chinese military treatise dating from the 5th century BC.',
        keywords: 'strategy, military, philosophy',
        totalCopies: 3,
        availableCopies: 1,
      ),
      Book(
        id: '4',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        summary: 'A novel of warmth and humor despite dealing with serious issues of rape and racial inequality.',
        keywords: 'fiction, classics, racism',
        totalCopies: 6,
        availableCopies: 4,
      ),
      Book(
        id: '5',
        title: '1984',
        author: 'George Orwell',
        summary: 'A dystopian social science fiction novel that examines the consequences of totalitarianism.',
        keywords: 'dystopian, classics, political fiction',
        totalCopies: 7,
        availableCopies: 5,
      ),
    ];
    
    setState(() {
      _filteredBooks = List.from(_books);
      _isLoading = false;
    });
  }

  void _filterBooks(String query) {
    setState(() {
      _searchQuery = query;
      if (query.isEmpty) {
        _filteredBooks = List.from(_books);
      } else {
        _filteredBooks = _books.where((book) {
          return book.title.toLowerCase().contains(query.toLowerCase()) ||
                 book.author.toLowerCase().contains(query.toLowerCase()) ||
                 (book.keywords != null && book.keywords!.toLowerCase().contains(query.toLowerCase()));
        }).toList();
      }
    });
  }

void _showErrorSnackBar(String message) {
  if (!mounted) return; // Check if widget is still mounted
  
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(message),
      backgroundColor: Colors.red.shade800,
      behavior: SnackBarBehavior.floating,
      duration: const Duration(seconds: 3),
    ),
  );
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: CustomScrollView(
        slivers: [
          // App Bar with Search
          SliverAppBar(
            backgroundColor: primaryColor,
            pinned: true,
            expandedHeight: 160.0,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                'Book Catalog',
                style: TextStyle(
                  color: backgroundColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 22,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [primaryColor, Color(0xFF1A3366)], // Gradient variation of blue
                    stops: [0.4, 1.0],
                  ),
                ),
                child: Stack(
                  children: [
                    Positioned(
                      right: -10,
                      top: -20,
                      child: Container(
                        width: 150,
                        height: 150,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: accentColor.withOpacity(0.2),
                        ),
                      ),
                    ),
                    Positioned(
                      left: -30,
                      bottom: -30,
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: secondaryColor.withOpacity(0.15),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Search Bar
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search for books, authors, keywords...',
                  hintStyle: TextStyle(
                    color: primaryColor.withOpacity(0.5),
                    fontSize: 16,
                  ),
                  prefixIcon: Icon(Icons.search, color: accentColor, size: 26),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: accentColor, width: 2),
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 16),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? GestureDetector(
                          onTap: () {
                            _searchController.clear();
                          },
                          child: Icon(Icons.clear, color: primaryColor.withOpacity(0.5)),
                        )
                      : null,
                ),
                style: TextStyle(
                  color: primaryColor,
                  fontSize: 16,
                ),
              ),
            ),
          ),

          // Books List
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            sliver: _isLoading
                ? SliverToBoxAdapter(
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 100),
                        child: CircularProgressIndicator(
                          color: accentColor,
                          strokeWidth: 3,
                        ),
                      ),
                    ),
                  )
                : _filteredBooks.isEmpty
                    ? SliverToBoxAdapter(
                        child: Center(
                          child: Column(
                            children: [
                              const SizedBox(height: 80),
                              Icon(
                                Icons.search_off,
                                size: 100,
                                color: secondaryColor,
                              ),
                              const SizedBox(height: 24),
                              Text(
                                'No books found for "$_searchQuery"',
                                style: TextStyle(
                                  fontSize: 18,
                                  color: primaryColor,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Try using different keywords',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: primaryColor.withOpacity(0.7),
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    : SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (BuildContext context, int index) {
                            return _buildBookListItem(_filteredBooks[index]);
                          },
                          childCount: _filteredBooks.length,
                        ),
                      ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(height: 20),
          ),
        ],
      ),
    );
  }

  Widget _buildBookListItem(Book book) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => BookDetailPage(book: book),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: primaryColor.withOpacity(0.08),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Book Cover
            Hero(
              tag: 'book-image-${book.id}',
              child: Container(
                width: 110,
                height: 160,
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    bottomLeft: Radius.circular(16),
                  ),
                image: DecorationImage(
                  image: _getBookImage(book),
                  fit: BoxFit.cover,
                ),
                ),
              ),
            ),
            // Book Info
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Book Title
                    Text(
                      book.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: primaryColor,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Author
                    Row(
                      children: [
                        Icon(Icons.person_outline, size: 16, color: accentColor),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            book.author,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 15,
                              color: primaryColor.withOpacity(0.8),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Availability Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: book.availableCopies > 0
                            ? Colors.green.withOpacity(0.15)
                            : Colors.red.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            book.availableCopies > 0
                                ? Icons.check_circle_outline
                                : Icons.timer,
                            size: 16,
                            color: book.availableCopies > 0
                                ? Colors.green[700]
                                : Colors.red[700],
                          ),
                          const SizedBox(width: 6),
                          Text(
                            book.availableCopies > 0
                                ? 'Available (${book.availableCopies})'
                                : 'Unavailable',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: book.availableCopies > 0
                                  ? Colors.green[700]
                                  : Colors.red[700],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Keywords (first 2 only)
                    // if (book.keywords != null && book.keywords!.isNotEmpty)
                    //   Wrap(
                    //     spacing: 8,
                    //     runSpacing: 8,
                    //     children: book.keywords!
                    //         .split(',')
                    //         .take(2)
                    //         .map((keyword) => Container(
                    //               padding: const EdgeInsets.symmetric(
                    //                   horizontal: 8, vertical: 4),
                    //               decoration: BoxDecoration(
                    //                 color: secondaryColor.withOpacity(0.2),
                    //                 borderRadius: BorderRadius.circular(8),
                    //               ),
                    //               child: Text(
                    //                 keyword.trim(),
                    //                 style: TextStyle(
                    //                   fontSize: 12,
                    //                   color: primaryColor,
                    //                   fontWeight: FontWeight.w500,
                    //                 ),
                    //               ),
                    //             ))
                    //         .toList(),
                    //   ),
                  ],
                ),
              ),
            ),
            // Arrow indicator
            Padding(
              padding: const EdgeInsets.all(16),
              child: Icon(
                Icons.chevron_right,
                color: accentColor,
                size: 28,
              ),
            ),
          ],
        ),
      ),
    );
  }
}