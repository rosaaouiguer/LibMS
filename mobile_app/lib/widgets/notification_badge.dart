// widgets/notification_badge.dart
import 'package:flutter/material.dart';
import '../styles/app_theme.dart';

class NotificationBadge extends StatelessWidget {
  final int count;
  final double size;
  final Widget child;

  const NotificationBadge({
    Key? key,
    required this.count,
    this.size = 18.0,
    required this.child,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        if (count > 0)
          Positioned(
            right: -5,
            top: -5,
            child: Container(
              padding: const EdgeInsets.all(4),
              constraints: BoxConstraints(
                minWidth: size,
                minHeight: size,
              ),
              decoration: BoxDecoration(
                color: AppTheme.accentColor,
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.white,
                  width: 1.5,
                ),
              ),
              child: Center(
                child: Text(
                  count > 99 ? '99+' : count.toString(),
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: size * 0.55,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}