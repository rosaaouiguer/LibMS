import 'package:flutter/material.dart';
import 'signin.dart';
import 'profile.dart';
import 'myLoans.dart';
import 'catalog_page.dart';
import '../widgets/navbar.dart'; // Import our custom nav bar

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  late AnimationController _pageTransitionController;
  late PageController _pageController = PageController(initialPage: 0);

  // List of pages/screens
  final List<Widget> _pages = [
    const CatalogPage(),
    MyLoansScreen(),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _currentIndex);
    _pageTransitionController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    _pageTransitionController.dispose();
    super.dispose();
  }

  void _onNavTap(int index) {
    if (_currentIndex != index) {
      _pageTransitionController.reset();
      _pageTransitionController.forward();
      
      // Animate to the new page
      _pageController.animateToPage(
        index,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      
      setState(() {
        _currentIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true, // Important for the transparent bottom bar
      body: PageView(
        controller: _pageController,
        physics: const NeverScrollableScrollPhysics(), // Disable swiping
        children: _pages,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
      bottomNavigationBar: AnimatedNavBar(
        currentIndex: _currentIndex,
        onTap: _onNavTap,
      ),
    );
  }
}