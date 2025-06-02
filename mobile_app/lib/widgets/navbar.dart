import 'package:flutter/material.dart';
import 'dart:ui';
import '../styles/app_theme.dart';

class AnimatedNavBar extends StatefulWidget {
  final int currentIndex;
  final Function(int) onTap;

  const AnimatedNavBar({
    Key? key,
    required this.currentIndex,
    required this.onTap,
  }) : super(key: key);

  @override
  State<AnimatedNavBar> createState() => _AnimatedNavBarState();
}

class _AnimatedNavBarState extends State<AnimatedNavBar> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  
  // List of nav items
  final List<NavItem> _navItems = [
    NavItem(
      icon: Icons.home_rounded,
      activeIcon: Icons.home_rounded, 
      label: 'Catalog',
    ),
    NavItem(
      icon: Icons.book_outlined,
      activeIcon: Icons.auto_stories,
      label: 'Loans',
    ),
    NavItem(
      icon: Icons.person_outline,
      activeIcon: Icons.person,
      label: 'Profile',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(AnimatedNavBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentIndex != widget.currentIndex) {
      _animationController.reset();
      _animationController.forward();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 80,
      margin: const EdgeInsets.all(16),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppTheme.primaryColor.withOpacity(0.95),
                  AppTheme.primaryColor.withOpacity(0.85),
                ],
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryColor.withOpacity(0.3),
                  blurRadius: 15,
                  spreadRadius: 5,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(_navItems.length, (index) {
                return _buildNavItem(index);
              }),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index) {
    final bool isSelected = widget.currentIndex == index;
    final NavItem item = _navItems[index];
    
    return GestureDetector(
      onTap: () {
        widget.onTap(index);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        width: isSelected ? 130 : 60,
        height: 50,
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected 
              ? AppTheme.accentColor 
              : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisAlignment: isSelected 
              ? MainAxisAlignment.spaceEvenly 
              : MainAxisAlignment.center,
          children: [
            // Icon with animation
            AnimatedScale(
              scale: isSelected ? 1.2 : 1.0,
              duration: const Duration(milliseconds: 300),
              child: AnimatedSlide(
                offset: isSelected 
                    ? const Offset(0, 0) 
                    : const Offset(0, 0.1),
                duration: const Duration(milliseconds: 300),
                child: Icon(
                  isSelected ? item.activeIcon : item.icon,
                  color: isSelected ? Colors.white : Colors.white.withOpacity(0.7),
                  size: 26,
                ),
              ),
            ),
            
            // Text with animation
            if (isSelected)
              Flexible(
                child: AnimatedOpacity(
                  opacity: isSelected ? 1.0 : 0.0,
                  duration: const Duration(milliseconds: 200),
                  child: FadeTransition(
                    opacity: _animationController,
                    child: SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0.2, 0),
                        end: Offset.zero,
                      ).animate(CurvedAnimation(
                        parent: _animationController,
                        curve: Curves.easeOutCubic,
                      )),
                      child: Text(
                        item.label,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// Helper class for navigation items
class NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}