import 'package:flutter/material.dart';
import '../styles/app_theme.dart';
import '../services/book_request_service.dart';
import '../models/book_request_model.dart';
import '../widgets/custom_snackbar.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import 'package:intl/intl.dart';

class BookRequestPage extends StatefulWidget {
  final String studentId;

  const BookRequestPage({Key? key, required this.studentId}) : super(key: key);

  @override
  State<BookRequestPage> createState() => _BookRequestPageState();
}

class _BookRequestPageState extends State<BookRequestPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late BookRequestService _bookRequestService;
  List<BookRequest> _bookRequests = [];
  bool _isLoading = true;
  bool _isSubmitting = false;

  // Form controllers
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _authorController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    final authService = Provider.of<AuthService>(context, listen: false);
    _bookRequestService = BookRequestService(authService);
    _loadBookRequests();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _titleController.dispose();
    _authorController.dispose();
    super.dispose();
  }

  Future<void> _loadBookRequests() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final requests = await _bookRequestService.getStudentBookRequests(widget.studentId);
      setState(() {
        _bookRequests = requests;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        showCustomSnackBar(
          context: context,
          message: 'Failed to load book requests: ${e.toString()}',
          isError: true,
        );
      }
    }
  }

  Future<void> _submitBookRequest() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final newRequest = {
        'title': _titleController.text,
        'author': _authorController.text,
        'studentId': widget.studentId,
      };

      await _bookRequestService.createBookRequest(newRequest);
      
      // Clear form and refresh list
      _titleController.clear();
      _authorController.clear();
      await _loadBookRequests();
      
      if (mounted) {
        showCustomSnackBar(
          context: context,
          message: 'Book request submitted successfully!',
          isError: false,
        );
      }
    } catch (e) {
      if (mounted) {
        showCustomSnackBar(
          context: context,
          message: 'Failed to submit request: ${e.toString()}',
          isError: true,
        );
      }
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Approved':
        return Colors.green;
      case 'Rejected':
        return Colors.red;
      default:
        return AppTheme.accentColor;
    }
  }

  Widget _buildRequestForm() {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryColor.withOpacity(0.08),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.secondaryColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.menu_book_rounded,
                      color: AppTheme.primaryColor,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Request New Book',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Fill the form below to request a book',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _titleController,
                decoration: InputDecoration(
                  labelText: 'Book Title',
                  hintText: 'Enter the name of the book',
                  prefixIcon: Icon(Icons.book, color: AppTheme.secondaryColor),
                  filled: true,
                  fillColor: AppTheme.backgroundColor,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppTheme.accentColor, width: 1.5),
                  ),
                  errorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.red, width: 1),
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                  floatingLabelStyle: TextStyle(color: AppTheme.accentColor),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a book title';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 18),
              TextFormField(
                controller: _authorController,
                decoration: InputDecoration(
                  labelText: 'Author',
                  hintText: 'Enter the author\'s name',
                  prefixIcon: Icon(Icons.person, color: AppTheme.secondaryColor),
                  filled: true,
                  fillColor: AppTheme.backgroundColor,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppTheme.accentColor, width: 1.5),
                  ),
                  errorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.red, width: 1),
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                  floatingLabelStyle: TextStyle(color: AppTheme.accentColor),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter the author name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 28),
              Container(
                height: 55,
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
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitBookRequest,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: EdgeInsets.zero,
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : const Text(
                          'Submit Request',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRequestsList() {
    if (_isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              height: 40,
              width: 40,
              child: CircularProgressIndicator(
                color: AppTheme.accentColor,
                strokeWidth: 3,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Loading your requests...',
              style: TextStyle(
                fontSize: 16,
                color: AppTheme.primaryColor.withOpacity(0.7),
              ),
            ),
          ],
        ),
      );
    }

    if (_bookRequests.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.secondaryColor.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.library_books,
                size: 64,
                color: AppTheme.secondaryColor,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'No Book Requests Yet',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: AppTheme.primaryColor,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Your submitted book requests will appear here',
              style: TextStyle(
                fontSize: 15,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 20),
            TextButton.icon(
              onPressed: () {
                _tabController.animateTo(0);  // Switch to the New Request tab
              },
              icon: Icon(Icons.add_circle_outline, color: AppTheme.accentColor),
              label: Text(
                'Make a New Request',
                style: TextStyle(
                  color: AppTheme.accentColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadBookRequests,
      color: AppTheme.accentColor,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _bookRequests.length,
        itemBuilder: (context, index) {
          final request = _bookRequests[index];
          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryColor.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
              border: Border.all(
                color: _getStatusColor(request.status).withOpacity(0.2),
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: _getStatusColor(request.status).withOpacity(0.08),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          request.title,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryColor,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: _getStatusColor(request.status).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(
                            color: _getStatusColor(request.status),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              request.status == 'Approved'
                                  ? Icons.check_circle
                                  : request.status == 'Rejected'
                                      ? Icons.cancel
                                      : Icons.schedule,
                              size: 14,
                              color: _getStatusColor(request.status),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              request.status,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: _getStatusColor(request.status),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.person_outline,
                            size: 16,
                            color: AppTheme.secondaryColor,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'By ${request.author}',
                            style: TextStyle(
                              fontSize: 15,
                              color: Colors.grey[700],
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today,
                            size: 14,
                            color: AppTheme.secondaryColor,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Requested on ${DateFormat('MMM dd, yyyy').format(request.requestedAt)}',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                      if (request.status == 'Approved')
                        Padding(
                          padding: const EdgeInsets.only(top: 12),
                          child: Row(
                            children: [
                              Icon(
                                Icons.info_outline,
                                size: 14,
                                color: Colors.green,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'This book will be added to the library soon',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.green,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: AppTheme.primaryColor,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: const Text(
          'Book Requests',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            height: 60,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor,
            ),
            child: Container(
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.3),
                borderRadius: BorderRadius.circular(30),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  gradient: LinearGradient(
                    colors: [AppTheme.accentColor, Color(0xFFFF9D30)],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.accentColor.withOpacity(0.3),
                      blurRadius: 5,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                labelColor: Colors.white,
                unselectedLabelColor: Colors.white.withOpacity(0.7),
                labelStyle: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
                unselectedLabelStyle: const TextStyle(
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                ),
                tabs: const [
                  Tab(
                    text: 'NEW REQUEST',
                    icon: Icon(Icons.add_circle_outline, size: 16),
                  ),
                  Tab(
                    text: 'MY REQUESTS',
                    icon: Icon(Icons.list_alt, size: 16),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          SingleChildScrollView(
            child: _buildRequestForm(),
          ),
          _buildRequestsList(),
        ],
      ),
    );
  }
}