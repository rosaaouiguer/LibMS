import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../services/auth_service.dart'; // Import AuthService
import 'package:provider/provider.dart'; // Import Provider
import '../services/reservation_service.dart';
import '../config/environment.dart';
import 'mainScreen.dart';
import '../styles/app_theme.dart';


// Model classes (keep the same as before)
class Loan {
  final String id;
  final Book book;
  final DateTime borrowingDate;
  final DateTime dueDate;
  final DateTime? returnDate;
  final String status;
  final String lendingCondition;

  Loan({
    required this.id,
    required this.book,
    required this.borrowingDate,
    required this.dueDate,
    this.returnDate,
    required this.status,
    required this.lendingCondition,
  });

  factory Loan.fromJson(Map<String, dynamic> json) {
    return Loan(
      id: json['_id'],
      book: Book.fromJson(json['bookId']),
      borrowingDate: DateTime.parse(json['borrowingDate']),
      dueDate: DateTime.parse(json['dueDate']),
      returnDate: json['returnDate'] != null
          ? DateTime.parse(json['returnDate'])
          : null,
      status: json['status'],
      lendingCondition: json['lendingCondition'],
    );
  }

  // Calculate days remaining before due date
  int get daysRemaining {
    if (returnDate != null) return 0;
    final now = DateTime.now();
    return dueDate.difference(now).inDays;
  }

  bool get isOverdue {
    return status == 'Overdue';
  }
}

class Reservation {
  final String id;
  final Book book;
  final DateTime reservationDate;
  final String status;
  final DateTime? availableDate;
  final DateTime? pickupDeadline;
  final int daysUntilExpiry;

  Reservation({
    required this.id,
    required this.book,
    required this.reservationDate,
    required this.status,
    this.availableDate,
    this.pickupDeadline,
    required this.daysUntilExpiry,
  });

  factory Reservation.fromJson(Map<String, dynamic> json) {
    return Reservation(
      id: json['_id'],
      book: Book.fromJson(json['bookId']),
      reservationDate: DateTime.parse(json['reservationDate']),
      status: json['status'],
      availableDate: json['availableDate'] != null
          ? DateTime.parse(json['availableDate'])
          : null,
      pickupDeadline: json['pickupDeadline'] != null
          ? DateTime.parse(json['pickupDeadline'])
          : null,
      daysUntilExpiry: json['daysUntilExpiry'],
    );
  }

  // Calculate days remaining until pickup deadline
  int get daysRemaining {
    if (pickupDeadline == null) return daysUntilExpiry;
    final now = DateTime.now();
    return pickupDeadline!.difference(now).inDays;
  }
}

class Book {
  final String id;
  final String title;
  final String author;
  final String isbn;
  final String imageURL;

  Book({
    required this.id,
    required this.title,
    required this.author,
    required this.isbn,
    required this.imageURL,
  });

  factory Book.fromJson(Map<String, dynamic> json) {
    return Book(
      id: json['_id'],
      title: json['title'],
      author: json['author'],
      isbn: json['isbn'] ?? '',
      imageURL: json['imageURL'] ?? '',
    );
  }
}

class MyLoansScreen extends StatefulWidget {
  const MyLoansScreen({Key? key}) : super(key: key);

  @override
  State<MyLoansScreen> createState() => _MyLoansScreenState();
}

class _MyLoansScreenState extends State<MyLoansScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  List<Loan> _loans = [];
  List<Reservation> _reservations = [];
  String? _errorMessage;
  final String _baseUrl = Environment.prodApiUrl;

  // Define our color palette
  final Color primaryColor = const Color(0xFF0C1F47); // Blue
  final Color accentColor = const Color(0xFFF37D00); // Orange
  final Color secondaryColor = const Color(0xFF9FADFD); // Light Violet
  final Color backgroundColor = const Color(0xFFF2F3F4); // Antiwhite
  final Color textColor = const Color(0xFF0C1F47); // Using blue as text color
  final Color cardColor = Colors.white;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    // We'll fetch data after the widget is fully initialized
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchUserLoans();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchUserLoans() async {
    if (!mounted) return; // Check if widget is still mounted before proceeding

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Get the AuthService instance from the Provider
      final authService = Provider.of<AuthService>(context, listen: false);

      // Check if user is authenticated
      if (!authService.isAuthenticated || authService.mongoId == null) {
        if (!mounted) return; // Check again before setting state
        setState(() {
          _errorMessage = 'You need to be logged in to view your loans';
          _isLoading = false;
        });
        return;
      }

      // Get the authenticated student's ID
      final String studentMongoId = authService.mongoId!;

      // Get authentication headers
      final headers = authService.getHeaders();

      // Fetch borrowings
      final borrowingsResponse = await http.get(
        Uri.parse('$_baseUrl/borrowings/student/$studentMongoId'),
        headers: headers,
      );

      // Fetch reservations
      final reservationsResponse = await http.get(
        Uri.parse('$_baseUrl/reservations/student/$studentMongoId'),
        headers: headers,
      );

      if (!mounted)
        return; // Check if widget is still mounted before processing responses

      if (borrowingsResponse.statusCode == 200) {
        final Map<String, dynamic> borrowingsData =
            json.decode(borrowingsResponse.body);
        if (borrowingsData['success']) {
          _loans = (borrowingsData['data'] as List)
              .map((item) => Loan.fromJson(item))
              .toList();
        }
      } else {
        _errorMessage =
            'Failed to load borrowings: ${borrowingsResponse.statusCode}';
        debugPrint('Failed to load borrowings: ${borrowingsResponse.body}');
      }

      if (reservationsResponse.statusCode == 200) {
        final Map<String, dynamic> reservationsData =
            json.decode(reservationsResponse.body);
        if (reservationsData['success']) {
          _reservations = (reservationsData['data'] as List)
              .map((item) => Reservation.fromJson(item))
              .toList();
        }
      } else {
        _errorMessage = _errorMessage ??
            'Failed to load reservations: ${reservationsResponse.statusCode}';
        debugPrint('Failed to load reservations: ${reservationsResponse.body}');
      }
    } catch (e) {
      if (!mounted)
        return; // Check if widget is still mounted before setting error state
      _errorMessage = 'Network error: ${e.toString()}';
      debugPrint('Error fetching loans: $e');
    } finally {
      if (mounted) {
        // Very important: Check if still mounted before calling setState
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _cancelReservation(String reservationId) async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final reservationService = ReservationService(authService);

    final result = await reservationService.cancelReservation(reservationId);

    if (result['success'] == true) {
      // Refresh the list after successful cancellation
      _fetchUserLoans();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Reservation cancelled'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Failed to cancel reservation'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

@override
Widget build(BuildContext context) {
  // Check if user is authenticated in the build method
  final authService = Provider.of<AuthService>(context);
  final bool isAuthenticated = authService.isAuthenticated;

  if (!isAuthenticated) {
    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: Text(
          'My Books',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
        centerTitle: false,
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [primaryColor, Color(0xFF1A3366)], // Gradient variation of blue
              stops: [0.4, 1.0],
            ),
          ),
        ),
        elevation: 4,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.lock_outline,
              size: 64,
              color: accentColor,
            ),
            const SizedBox(height: 16),
            Text(
              'Authentication Required',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Please log in to view your loans and reservations',
              style: TextStyle(
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              icon: const Icon(Icons.login),
              label: const Text('Log In'),
              style: ElevatedButton.styleFrom(
                backgroundColor: accentColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              onPressed: () {
                // Navigate to login screen
                Navigator.of(context).pushReplacementNamed('/login');
              },
            ),
          ],
        ),
      ),
    );
  }

  return Scaffold(
    backgroundColor: backgroundColor,
    body: NestedScrollView(
      headerSliverBuilder: (BuildContext context, bool innerBoxIsScrolled) {
        return <Widget>[
          SliverAppBar(
            backgroundColor: primaryColor,
            pinned: true,
            expandedHeight: 160.0,
            forceElevated: innerBoxIsScrolled,
            title: Text(
              'My Books',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 22,
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: EdgeInsets.zero,
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
            bottom: TabBar(
              controller: _tabController,
              indicatorColor: accentColor,
              indicatorWeight: 3.0,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white.withOpacity(0.7),
              tabs: [
                Tab(
                  text: "Borrowed (${_loans.where((loan) => loan.returnDate == null).length})",
                  icon: Icon(Icons.book),
                ),
                Tab(
                  text: "Reserved (${_reservations.length})",
                  icon: Icon(Icons.bookmark),
                ),
              ],
            ),
          ),
        ];
      },
      body: _isLoading
          ? _buildLoadingIndicator()
          : _errorMessage != null
              ? _buildErrorState()
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildBorrowedBooks(),
                    _buildReservedBooks(),
                  ],
                ),
    ),
  );
}

  // The remaining widget building methods stay the same
  Widget _buildLoadingIndicator() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            color: accentColor,
          ),
          const SizedBox(height: 16),
          Text(
            'Loading your books...',
            style: TextStyle(
              color: textColor,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: accentColor,
          ),
          const SizedBox(height: 16),
          Text(
            'Oops! Something went wrong',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _errorMessage ?? 'Unknown error',
            style: TextStyle(
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.refresh),
            label: const Text('Try Again'),
            style: ElevatedButton.styleFrom(
              backgroundColor: accentColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            onPressed: _fetchUserLoans,
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyBorrowedState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: secondaryColor.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.menu_book,
              size: 50,
              color: secondaryColor,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'No borrowed books',
            style: TextStyle(
              fontSize: 18,
              color: textColor,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'When you borrow books, they will appear here',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.add),
            label: const Text('Browse Books'),
            style: ElevatedButton.styleFrom(
              backgroundColor: accentColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
onPressed: () {
  // Find the nearest PageController in the widget tree
  final pageController = context.findAncestorWidgetOfExactType<PageView>()?.controller;
  if (pageController != null && pageController.hasClients) {
    pageController.animateToPage(
      0,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }
},
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyReservedState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: secondaryColor.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.bookmark_border,
              size: 50,
              color: secondaryColor,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'No reserved books',
            style: TextStyle(
              fontSize: 18,
              color: textColor,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'When you reserve books, they will appear here',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.add),
            label: const Text('Browse Books'),
            style: ElevatedButton.styleFrom(
              backgroundColor: accentColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
onPressed: () {
  // Find the nearest PageController in the widget tree
  final pageController = context.findAncestorWidgetOfExactType<PageView>()?.controller;
  if (pageController != null && pageController.hasClients) {
    pageController.animateToPage(
      0,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }
},
          ),
        ],
      ),
    );
  }

  Widget _buildBorrowedBooks() {
    final activeBorrowings =
        _loans.where((loan) => loan.returnDate == null).toList();

    if (activeBorrowings.isEmpty) {
      return _buildEmptyBorrowedState();
    }

    return RefreshIndicator(
      onRefresh: _fetchUserLoans,
      color: accentColor,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: activeBorrowings.length,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: LoanCard(
              loan: activeBorrowings[index],
              primaryColor: primaryColor,
              accentColor: accentColor,
              cardColor: cardColor,
              textColor: textColor,
            ),
          );
        },
      ),
    );
  }

  Widget _buildReservedBooks() {
    if (_reservations.isEmpty) {
      return _buildEmptyReservedState();
    }

    return RefreshIndicator(
      onRefresh: _fetchUserLoans,
      color: accentColor,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _reservations.length,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: ReservationCard(
              reservation: _reservations[index],
              primaryColor: primaryColor,
              accentColor: accentColor,
              secondaryColor: secondaryColor,
              cardColor: cardColor,
              textColor: textColor,
              onCancelReservation: _cancelReservation,
            ),
          );
        },
      ),
    );
  }
}

// Keep the LoanCard and ReservationCard widgets the same...
class LoanCard extends StatelessWidget {
  final Loan loan;
  final Color primaryColor;
  final Color accentColor;
  final Color cardColor;
  final Color textColor;

  const LoanCard({
    Key? key,
    required this.loan,
    required this.primaryColor,
    required this.accentColor,
    required this.cardColor,
    required this.textColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final dateFormatter = DateFormat('MMM dd, yyyy');

    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Loan status banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 6),
            decoration: BoxDecoration(
              color: _getStatusColor().withOpacity(0.2),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Center(
              child: Text(
                _getStatusText(),
                style: TextStyle(
                  color: _getStatusColor(),
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Book cover image
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 100,
                    height: 150,
                    color: Colors.grey.shade200,
                    child: loan.book.imageURL.isNotEmpty
                        ? Image.network(
                            loan.book.imageURL,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Icon(
                              Icons.book,
                              size: 50,
                              color: Colors.grey.shade400,
                            ),
                          )
                        : Center(
                            child: Icon(
                              Icons.book,
                              size: 50,
                              color: Colors.grey.shade400,
                            ),
                          ),
                  ),
                ),
                const SizedBox(width: 16),
                // Book details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        loan.book.title,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: textColor,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'by ${loan.book.author}',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade700,
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Loan details
                      _buildInfoRow(
                        Icons.calendar_today,
                        'Borrowed: ${dateFormatter.format(loan.borrowingDate)}',
                      ),
                      const SizedBox(height: 8),
                      _buildInfoRow(
                        Icons.home,
                        'Due: ${dateFormatter.format(loan.dueDate)}',
                        textColor: loan.isOverdue ? Colors.red : null,
                      ),
                      const SizedBox(height: 8),
                      _buildInfoRow(
                        Icons.auto_stories,
                        'Condition: ${loan.lendingCondition}',
                      ),
                      const SizedBox(height: 16),
                      // Time remaining indicator
                      _buildTimeRemainingIndicator(loan),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text, {Color? textColor}) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: Colors.grey.shade600,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 14,
              color: textColor ?? Colors.grey.shade700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTimeRemainingIndicator(Loan loan) {
    Color progressColor;
    String statusText;

    if (loan.isOverdue) {
      progressColor = Colors.red;
      statusText = 'Overdue';
    } else if (loan.daysRemaining <= 2) {
      progressColor = Colors.orange;
      statusText = '${loan.daysRemaining} days left';
    } else {
      progressColor = Colors.green;
      statusText = '${loan.daysRemaining} days left';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Progress bar
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: _calculateProgressValue(loan),
            backgroundColor: Colors.grey.shade200,
            color: progressColor,
            minHeight: 6,
          ),
        ),
        const SizedBox(height: 6),
        // Status text
        Row(
          children: [
            Icon(
              loan.isOverdue ? Icons.warning : Icons.access_time,
              size: 14,
              color: progressColor,
            ),
            const SizedBox(width: 4),
            Text(
              statusText,
              style: TextStyle(
                fontSize: 12,
                color: progressColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Calculate progress value between 0.0 and 1.0
  double _calculateProgressValue(Loan loan) {
    if (loan.isOverdue) return 1.0;

    final totalDuration = loan.dueDate.difference(loan.borrowingDate).inDays;
    final elapsed = DateTime.now().difference(loan.borrowingDate).inDays;

    if (totalDuration <= 0) return 1.0;

    return elapsed / totalDuration;
  }

  String _getStatusText() {
    if (loan.isOverdue) {
      return 'OVERDUE';
    } else if (loan.daysRemaining <= 2) {
      return 'DUE SOON';
    } else {
      return 'BORROWED';
    }
  }

  Color _getStatusColor() {
    if (loan.isOverdue) {
      return Colors.red;
    } else if (loan.daysRemaining <= 2) {
      return Colors.orange;
    } else {
      return Colors.green;
    }
  }
}

class ReservationCard extends StatelessWidget {
  final Reservation reservation;
  final Color primaryColor;
  final Color accentColor;
  final Color secondaryColor;
  final Color cardColor;
  final Color textColor;
  final Function(String) onCancelReservation; 

  const ReservationCard({
    Key? key,
    required this.reservation,
    required this.primaryColor,
    required this.accentColor,
    required this.secondaryColor,
    required this.cardColor,
    required this.textColor,
    required this.onCancelReservation,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final dateFormatter = DateFormat('MMM dd, yyyy');

    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(
          color: _getStatusColor().withOpacity(0.3),
          width: 1.5,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Status indicator
            Row(
              children: [
                Icon(
                  _getStatusIcon(),
                  size: 18,
                  color: _getStatusColor(),
                ),
                const SizedBox(width: 8),
                Text(
                  _getStatusText(),
                  style: TextStyle(
                    color: _getStatusColor(),
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const Spacer(),
                _buildStatusChip(),
              ],
            ),
            const SizedBox(height: 16),
            // Book details
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Book cover image
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 100,
                    height: 150,
                    color: Colors.grey.shade200,
                    child: reservation.book.imageURL.isNotEmpty
                        ? Image.network(
                            reservation.book.imageURL,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Icon(
                              Icons.book,
                              size: 50,
                              color: Colors.grey.shade400,
                            ),
                          )
                        : Center(
                            child: Icon(
                              Icons.book,
                              size: 50,
                              color: Colors.grey.shade400,
                            ),
                          ),
                  ),
                ),
                const SizedBox(width: 16),
                // Book details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        reservation.book.title,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: textColor,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'by ${reservation.book.author}',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade700,
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Reservation details
                      _buildInfoRow(
                        Icons.calendar_today,
                        'Reserved: ${dateFormatter.format(reservation.reservationDate)}',
                      ),
                      if (reservation.availableDate != null) ...[
                        const SizedBox(height: 8),
                        _buildInfoRow(
                          Icons.check_circle_outline,
                          'Available: ${dateFormatter.format(reservation.availableDate!)}',
                        ),
                      ],
                      if (reservation.pickupDeadline != null) ...[
                        const SizedBox(height: 8),
                        _buildInfoRow(
                          Icons.warning_amber_outlined,
                          'Pickup by: ${dateFormatter.format(reservation.pickupDeadline!)}',
                          textColor: _isPickupUrgent() ? Colors.red : null,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Action buttons
            Row(
              children: [
                if (reservation.status == 'Held' || reservation.status == 'Awaiting Pickup')
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.cancel_outlined),
                      label: const Text('Cancel Reservation'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: primaryColor,
                        side: BorderSide(color: primaryColor),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
// Replace the current onPressed function in the ReservationCard class with this:
onPressed: () {
  showDialog(
    context: context,
    barrierColor: AppTheme.primaryColor.withOpacity(0.4),
    builder: (context) => Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      elevation: 10,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: AppTheme.accentColor.withOpacity(0.1),
              spreadRadius: 2,
              blurRadius: 20,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Stylish header
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.primaryColor, AppTheme.primaryColor.withOpacity(0.9)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                ),
              ),
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.warning_rounded,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  const Text(
                    'Cancel Reservation',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
            ),
            
            // Content padding
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Are you sure you want to cancel your reservation for:',
                    style: TextStyle(
                      color: AppTheme.textColor,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 18),
                  
                  // Book details card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppTheme.backgroundColor,
                          AppTheme.secondaryColor.withOpacity(0.1),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.secondaryColor.withOpacity(0.1),
                          spreadRadius: 0,
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // Book cover image with shadow and border
                        Container(
                          width: 60,
                          height: 85,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                spreadRadius: 0,
                                blurRadius: 5,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: reservation.book.imageURL.isNotEmpty
                              ? Image.network(
                                  reservation.book.imageURL,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => Container(
                                    color: AppTheme.secondaryColor.withOpacity(0.3),
                                    child: Icon(
                                      Icons.book,
                                      size: 28,
                                      color: AppTheme.primaryColor.withOpacity(0.7),
                                    ),
                                  ),
                                )
                              : Container(
                                  color: AppTheme.secondaryColor.withOpacity(0.3),
                                  child: Icon(
                                    Icons.book,
                                    size: 28,
                                    color: AppTheme.primaryColor.withOpacity(0.7),
                                  ),
                                ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        
                        // Book details
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                reservation.book.title,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primaryColor,
                                  fontSize: 16,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'by ${reservation.book.author}',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontStyle: FontStyle.italic,
                                  color: AppTheme.textColor.withOpacity(0.7),
                                ),
                              ),
                              const SizedBox(height: 8),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 20),
                  
                  // Warning message
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppTheme.accentColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppTheme.accentColor.withOpacity(0.3),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          size: 18,
                          color: AppTheme.accentColor,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'This action cannot be undone. The book will be made available for other students.',
                            style: TextStyle(
                              color: AppTheme.textColor.withOpacity(0.8),
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            // Divider
            Divider(height: 1, color: Colors.grey.withOpacity(0.2)),
            
            // Action buttons
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Keep button
                  Expanded(
                    child: TextButton(
                      onPressed: () => Navigator.pop(context),
                      style: TextButton.styleFrom(
                        foregroundColor: AppTheme.primaryColor,
                        backgroundColor: AppTheme.backgroundColor,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(
                            color: AppTheme.primaryColor.withOpacity(0.3),
                          ),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: const Text(
                        'Keep Reservation',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(width: 12),
                  
                  // Cancel button
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: LinearGradient(
                          colors: [AppTheme.accentColor, Color(0xFFFF9D30)],
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.accentColor.withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: () {
                          // Close dialog first
                          Navigator.pop(context);
                          // Then cancel the reservation
                          onCancelReservation(reservation.id);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          foregroundColor: Colors.white,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: const Text(
                          'Cancel Reservation',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
},
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text, {Color? textColor}) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: Colors.grey.shade600,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 14,
              color: textColor ?? Colors.grey.shade700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatusChip() {
    Color chipColor;
    Color textColor = Colors.white;
    String daysText = '';

    if (reservation.status == 'Awaiting Pickup') {
      if (_isPickupUrgent()) {
        chipColor = Colors.red;
        daysText = '${reservation.daysRemaining} days left to pick up';
      } else {
        chipColor = accentColor;
        daysText = '${reservation.daysRemaining} days to pick up';
      }
    } else if (reservation.status == 'Held') {
      chipColor = secondaryColor;
      textColor = primaryColor;
      daysText = 'In queue';
    } else {
      chipColor = Colors.grey;
      daysText = 'Cancelled';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: chipColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        daysText,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _getStatusText() {
    switch (reservation.status) {
      case 'Held':
        return 'Book Reserved';
      case 'Awaiting Pickup':
        return 'Ready for Pickup';
      case 'Cancelled':
        return 'Reservation Cancelled';
      default:
        return reservation.status;
    }
  }

  IconData _getStatusIcon() {
    switch (reservation.status) {
      case 'Held':
        return Icons.bookmark;
      case 'Awaiting Pickup':
        return Icons.local_library;
      case 'Cancelled':
        return Icons.cancel;
      default:
        return Icons.book;
    }
  }

  Color _getStatusColor() {
    switch (reservation.status) {
      case 'Held':
        return secondaryColor;
      case 'Awaiting Pickup':
        return _isPickupUrgent() ? Colors.red : accentColor;
      case 'Cancelled':
        return Colors.grey;
      default:
        return primaryColor;
    }
  }

  bool _isPickupUrgent() {
    return reservation.pickupDeadline != null && reservation.daysRemaining <= 2;
  }
}
