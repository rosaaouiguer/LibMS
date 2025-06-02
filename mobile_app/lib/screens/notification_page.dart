import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';
import '../services/auth_service.dart';
import '../styles/app_theme.dart';
import '../widgets/empty_state.dart';

class NotificationsPage extends StatefulWidget {
  final String studentId;

  const NotificationsPage({Key? key, required this.studentId}) : super(key: key);

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> with TickerProviderStateMixin {
  late NotificationService _notificationService;
  bool _isLoading = true;
  List<AppNotification> _notifications = [];
  late TabController _tabController;
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _notificationService = NotificationService();
    // Initialize the notification service with auth service
    final authService = Provider.of<AuthService>(context, listen: false);
    _notificationService.initialize(authService);
    
    _tabController = TabController(length: 2, vsync: this);
    _loadNotifications();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final notifications = await _notificationService.getNotifications(widget.studentId);
      
      // Count unread notifications
      final unreadCount = notifications.where((notification) => !notification.read).length;
      
      setState(() {
        _notifications = notifications;
        _unreadCount = unreadCount;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading notifications: $e')),
      );
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      await _notificationService.markAllAsRead(widget.studentId);
      _loadNotifications();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All notifications marked as read')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error marking all as read: $e')),
      );
    }
  }

  Future<void> _markAsRead(String notificationId) async {
    try {
      await _notificationService.markAsRead(notificationId);
      _loadNotifications();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error marking notification as read: $e')),
      );
    }
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'Due Date Reminders':
        return Colors.amber;
      case 'Overdue Alerts':
        return Colors.red;
      case 'Announcements':
        return AppTheme.accentColor;
      default:
        return AppTheme.secondaryColor;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'Due Date Reminders':
        return Icons.event_note;
      case 'Overdue Alerts':
        return Icons.warning_amber;
      case 'Announcements':
        return Icons.campaign;
      default:
        return Icons.notifications;
    }
  }

  Widget _buildNotificationItem(AppNotification notification) {
    final Color categoryColor = _getCategoryColor(notification.category);
    final IconData categoryIcon = _getCategoryIcon(notification.category);
    final formatter = DateFormat('MMM dd, yyyy • hh:mm a');
    final formattedDate = formatter.format(notification.createdAt);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Container(
        decoration: BoxDecoration(
          color: notification.read ? Colors.white : AppTheme.primaryColor.withOpacity(0.05),
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
        child: InkWell(
          onTap: () => _markAsRead(notification.id),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: categoryColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    categoryIcon,
                    color: categoryColor,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: categoryColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              notification.category,
                              style: TextStyle(
                                color: categoryColor,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          if (!notification.read)
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: AppTheme.accentColor,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        notification.message,
                        style: const TextStyle(
                          fontSize: 16,
                          color: AppTheme.textColor,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        formattedDate,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: EmptyState(
        icon: Icons.notifications_off,
        title: 'No Notifications',
        message: message,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Filter notifications for tabs
    final unreadNotifications = _notifications.where((n) => !n.read).toList();
    final allNotifications = _notifications;

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
                leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white,),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: const Text(
          'Notifications',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: AppTheme.primaryColor,
        elevation: 0,
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white.withOpacity(0.7),
          indicatorColor: AppTheme.accentColor,
          tabs: [
            Tab(text: 'All (${allNotifications.length})'),
            Tab(text: 'Unread ($_unreadCount)'),
          ],
        ),
        actions: [
          if (_unreadCount > 0)
            IconButton(
              icon: const Icon(Icons.done_all, color: Colors.white),
              onPressed: _markAllAsRead,
              tooltip: 'Mark all as read',
            ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: AppTheme.accentColor,
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      // All notifications tab
                      allNotifications.isEmpty
                          ? _buildEmptyState('You have no notifications')
                          : ListView.builder(
                              padding: const EdgeInsets.only(top: 8, bottom: 24),
                              itemCount: allNotifications.length,
                              itemBuilder: (context, index) {
                                return _buildNotificationItem(allNotifications[index]);
                              },
                            ),
                      
                      // Unread notifications tab
                      unreadNotifications.isEmpty
                          ? _buildEmptyState('You have no unread notifications')
                          : ListView.builder(
                              padding: const EdgeInsets.only(top: 8, bottom: 24),
                              itemCount: unreadNotifications.length,
                              itemBuilder: (context, index) {
                                return _buildNotificationItem(unreadNotifications[index]);
                              },
                            ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}