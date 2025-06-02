import 'package:flutter/material.dart';

class BookDetailWidget extends StatefulWidget {
  final String title;
  final String imageUrl;
  final String description;
  final double rating;
  final VoidCallback onDismiss;

  const BookDetailWidget({
    Key? key,
    required this.title,
    required this.imageUrl,
    required this.description,
    required this.rating,
    required this.onDismiss,
  }) : super(key: key);

  @override
  State<BookDetailWidget> createState() => _BookDetailWidgetState();
}

class _BookDetailWidgetState extends State<BookDetailWidget> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<Offset> _slideAnimation;
  bool _isLiked = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 1),  // Start from bottom
      end: Offset.zero,           // End at normal position
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));
    
    // Start the animation
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SlideTransition(
      position: _slideAnimation,
      child: GestureDetector(
        onVerticalDragEnd: (details) {
          if (details.primaryVelocity! > 300) {
            // If swiped down with enough velocity
            _animationController.reverse().then((_) {
              widget.onDismiss();
            });
          }
        },
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                spreadRadius: 1,
              ),
            ],
          ),
          margin: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Book cover and like button
              Stack(
                children: [
                  // Book cover image
                  ClipRRect(
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
                    child: Image.network(
                      widget.imageUrl,
                      height: 200,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          height: 200,
                          color: Colors.purple.shade100,
                          child: Center(
                            child: Icon(Icons.book, size: 64, color: Colors.purple.shade800),
                          ),
                        );
                      },
                    ),
                  ),
                  
                  // Like button
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _isLiked = !_isLiked;
                        });
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 4,
                              spreadRadius: 1,
                            ),
                          ],
                        ),
                        child: Icon(
                          Icons.favorite,
                          color: _isLiked ? Colors.purple : Colors.grey.shade400,
                          size: 24,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              
              // Book details
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(
                      widget.title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    
                    // Description
                    Text(
                      widget.description,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Review section
                    const Text(
                      "Review",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    
                    // Star rating
                    Row(
                      children: [
                        ...List.generate(5, (index) {
                          return Icon(
                            index < widget.rating.floor() 
                                ? Icons.star 
                                : (index < widget.rating 
                                    ? Icons.star_half 
                                    : Icons.star_border),
                            color: Colors.amber,
                            size: 24,
                          );
                        }),
                        const SizedBox(width: 8),
                        Text(
                          "(${widget.rating.toStringAsFixed(1)})",
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey.shade700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    
                    // Demand Loan button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          // Handle loan request
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.purple,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text(
                          "Demand Loan",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
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
  }
}