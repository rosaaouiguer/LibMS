import 'package:flutter/material.dart';
import '../styles/app_theme.dart';
import '../services/student_service.dart';
import '../models/student_model.dart';
import 'myAccountScreen.dart';
import '../widgets/logoutConfirmation.dart';
import 'helpCenterPage.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import 'signin.dart';
import 'notification_page.dart';
import '../widgets/notification_badge.dart';
import '../services/notification_service.dart';
import 'library_rules_page.dart';
import 'book_request_page.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late StudentService _studentService;
  late NotificationService _notificationService;
  bool _isLoading = true;
  Student? _student;
  int _unreadNotificationsCount = 0;

  @override
  void initState() {
    super.initState();
    final authService = Provider.of<AuthService>(context, listen: false);
    _studentService = StudentService(authService);
    _notificationService = NotificationService();
    _notificationService.initialize(authService);
    _loadStudentData();
    _loadUnreadNotificationsCount();
  }

  Future<void> _loadUnreadNotificationsCount() async {
    if (_student != null) {
      try {
        final count = await _notificationService.getUnreadCount(_student!.id);
        setState(() {
          _unreadNotificationsCount = count;
        });
      } catch (e) {
        // Handle error silently
        debugPrint('Error loading unread count: $e');
      }
    }
  }

  Widget _buildNotificationMenuItem() {
    return InkWell(
      onTap: () {
        if (_student != null) {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => NotificationsPage(studentId: _student!.id),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content:
                    Text('Unable to load notifications. Please try again.')),
          );
        }
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                spreadRadius: 1,
                blurRadius: 3,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.accentColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: NotificationBadge(
                  count: _unreadNotificationsCount,
                  child: const Icon(
                    Icons.notifications,
                    color: AppTheme.accentColor,
                    size: 24,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Notifications',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textColor,
                      ),
                    ),
                    Text(
                      _unreadNotificationsCount > 0
                          ? 'You have $_unreadNotificationsCount unread notifications'
                          : 'No new notifications',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right,
                color: AppTheme.secondaryColor,
                size: 22,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _loadStudentData() async {
    try {
      final student = await _studentService.getCurrentStudent();
      if (mounted) {
        // Add this check
        setState(() {
          _student = student;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        // Add this check here too
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading profile: $e')),
        );
      }
    }
  }

  void _handleLogout() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    await authService.logout();

    // Navigate back to login screen
    Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const LoginPage()),
        (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text(
          'Profile',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: AppTheme.primaryColor,
        elevation: 0,
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: AppTheme.accentColor,
              ),
            )
          : _student == null
              ? const Center(
                  child: Text('Failed to load student data'),
                )
              : Column(
                  children: [
                    // User Info Section with fancy styling
                    // Container(
                    //   color: AppTheme.primaryColor,
                    //   padding: const EdgeInsets.only(bottom: 24.0),
                    //   child: Column(
                    //     children: [
                    //       const SizedBox(height: 16),
                    //       // Profile Picture
                    //       Container(
                    //         padding: const EdgeInsets.all(3),
                    //         decoration: BoxDecoration(
                    //           shape: BoxShape.circle,
                    //           border: Border.all(color: AppTheme.accentColor, width: 2),
                    //         ),
                    //         child: CircleAvatar(
                    //           radius: 45,
                    //           backgroundColor: AppTheme.secondaryColor.withOpacity(0.3),
                    //           backgroundImage: _student!.image.startsWith('http') || _student!.image.startsWith('/uploads')
                    //             ? NetworkImage('https://lms-backend-zjt1.onrender.com/api${_student!.image}')
                    //             : null,
                    //           child: _student!.image.startsWith('http') || _student!.image.startsWith('/uploads')
                    //               ? null
                    //               : Icon(
                    //                   Icons.person,
                    //                   size: 45,
                    //                   color: AppTheme.backgroundColor,
                    //                 ),
                    //         ),
                    //       ),
                    //       const SizedBox(height: 12),
                    //       // Name and ID
                    //       Text(
                    //         _student!.name,
                    //         style: const TextStyle(
                    //           fontSize: 22,
                    //           fontWeight: FontWeight.bold,
                    //           color: Colors.white,
                    //         ),
                    //       ),
                    //       const SizedBox(height: 4),
                    //       Text(
                    //         _student!.studentId,
                    //         style: TextStyle(
                    //           fontSize: 16,
                    //           color: Colors.white.withOpacity(0.8),
                    //         ),
                    //       ),
                    //       const SizedBox(height: 8),
                    //       // Category badge
                    //       Container(
                    //         padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    //         decoration: BoxDecoration(
                    //           color: AppTheme.accentColor,
                    //           borderRadius: BorderRadius.circular(20),
                    //         ),
                    //         child: Text(
                    //           _student!.category.name,
                    //           style: const TextStyle(
                    //             color: Colors.white,
                    //             fontWeight: FontWeight.w500,
                    //           ),
                    //         ),
                    //       ),
                    //     ],
                    //   ),
                    // ),

                    // Stats section
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      color: Colors.white,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildStatItem(
                            'Books Limit',
                            _student!.category.borrowingLimit.toString(),
                            Icons.book,
                          ),
                          _buildStatDivider(),
                          _buildStatItem(
                            'Loan Days',
                            _student!.category.loanDuration.toString(),
                            Icons.calendar_today,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Menu Items
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        child: Column(
                          children: [
                            _buildMenuItem(
                              icon: Icons.person,
                              title: 'My Account',
                              subtitle: 'Edit your personal details',
                              iconColor: AppTheme.primaryColor,
                              onTap: () {
                                Navigator.of(context)
                                    .push(
                                      MaterialPageRoute(
                                        builder: (context) => MyAccountScreen(
                                            mongoId: _student!.id),
                                      ),
                                    )
                                    .then((_) => _loadStudentData());
                              },
                            ),
                            _buildNotificationMenuItem(),
                            _buildMenuItem(
                              icon: Icons.library_books,
                              title: 'Book Requests',
                              subtitle:
                                  'Request new books and view your requests',
                              iconColor: AppTheme.secondaryColor,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) => BookRequestPage(
                                        studentId: _student!.id),
                                  ),
                                );
                              },
                            ),
                            _buildMenuItem(
                              icon: Icons.menu_book,
                              title: 'Library Rules',
                              subtitle: 'View library guidelines and policies',
                              iconColor: AppTheme.accentColor,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                      builder: (context) =>
                                          const LibraryRulesPage()),
                                );
                              },
                            ),
                            const SizedBox(height: 8),
                            _buildMenuItem(
                              icon: Icons.help_center,
                              title: 'Help Center',
                              subtitle: 'Get support and assistance',
                              iconColor: AppTheme.primaryColor,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                      builder: (context) =>
                                          const HelpCenterPage()),
                                );
                              },
                            ),
                            const SizedBox(height: 8),
                            // Logout Button
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 16.0),
                              child: ElevatedButton(
                                onPressed: () {
                                  showModalBottomSheet(
                                    context: context,
                                    isScrollControlled: true,
                                    backgroundColor: Colors.transparent,
                                    builder: (BuildContext context) {
                                      return LogoutConfirmationWidget(
                                        onLogout: () {
                                          Navigator.pop(
                                              context); // Close the bottom sheet
                                          _handleLogout();
                                        },
                                        onCancel: () {
                                          Navigator.pop(
                                              context); // Close the bottom sheet
                                        },
                                      );
                                    },
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red.shade50,
                                  foregroundColor: Colors.red,
                                  elevation: 0,
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    side:
                                        BorderSide(color: Colors.red.shade200),
                                  ),
                                ),
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.logout),
                                    SizedBox(width: 8),
                                    Text(
                                      'Logout',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(
          icon,
          color: AppTheme.accentColor,
          size: 24,
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
            color: AppTheme.primaryColor,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildStatDivider() {
    return Container(
      height: 40,
      width: 1,
      color: Colors.grey[300],
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                spreadRadius: 1,
                blurRadius: 3,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  icon,
                  color: iconColor,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textColor,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right,
                color: AppTheme.secondaryColor,
                size: 22,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
