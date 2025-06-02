import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Reading App Onboarding',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
        fontFamily: 'Roboto',
      ),
      debugShowCheckedModeBanner: false,
      home: const OnboardingScreen(),
    );
  }
}

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingPage> _pages = [
    OnboardingPage(
      image: 'assets/onboarding.png',
      title: 'Now reading books\nwill be easier',
      description: 'Discover new worlds, join a vibrant reading community. Start your reading adventure effortlessly with us.',
      buttonText: 'Continue',
    ),
    OnboardingPage(
      image: 'assets/onboarding1.png',
      title: 'Your Bookish Soulmate\nAwaits',
      description: 'Let us be your guide to the perfect read. Discover books tailored to your tastes for a truly rewarding experience.',
      buttonText: 'Get Started',
    ),
    OnboardingPage(
      image: 'assets/onboarding.png',
      title: 'Start Your Adventure',
      description: 'Ready to embark on a quest for inspiration and knowledge? Your adventure begins now. Let\'s go!',
      buttonText: 'Get Started',
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentPage = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Skip button at the top
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: TextButton(
                  onPressed: () {
                    // Handle skip action
                  },
                  child: const Text(
                    'Skip',
                    style: TextStyle(
                      color: Color(0xFF6A1B9A),
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ),
            
            // Page content
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: _onPageChanged,
                itemCount: _pages.length,
                itemBuilder: (context, index) {
                  return _buildPage(_pages[index]);
                },
              ),
            ),
            
            // Page indicators
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _pages.length,
                  (index) => _buildDotIndicator(index),
                ),
              ),
            ),
            
            // Bottom button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              child: ElevatedButton(
                onPressed: () {
                  if (_currentPage < _pages.length - 1) {
                    _pageController.nextPage(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                    );
                  } else {
                    // Handle onboarding completion
                    debugPrint('Onboarding completed! Navigate to main app.');
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6A1B9A),
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  _pages[_currentPage].buttonText,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            
            // Sign in text
            Padding(
              padding: const EdgeInsets.only(bottom: 32),
              child: TextButton(
                onPressed: () {
                  // Handle sign in action
                },
                child: const Text(
                  'Sign in',
                  style: TextStyle(
                    color: Color(0xFF6A1B9A),
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
            
            // Bottom line decoration
            Container(
              width: 100,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.black12,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildPage(OnboardingPage page) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Image
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Image.asset(
              page.image,
              height: 220,
            ),
          ),
          const SizedBox(height: 40),
          
          // Title
          Text(
            page.title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 20),
          
          // Description
          Text(
            page.description,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              color: Colors.black54,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDotIndicator(int index) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: index == _currentPage ? const Color(0xFF6A1B9A) : Colors.grey.shade300,
      ),
    );
  }
}

class OnboardingPage {
  final String image;
  final String title;
  final String description;
  final String buttonText;

  OnboardingPage({
    required this.image,
    required this.title,
    required this.description,
    required this.buttonText,
  });
}