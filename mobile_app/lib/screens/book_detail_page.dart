import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:io' show Platform;
import 'package:flutter/services.dart';
import '../models/book_model.dart';
import '../services/reservation_service.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import 'dart:convert';

class BookDetailPage extends StatefulWidget {
  final Book book;

  const BookDetailPage({Key? key, required this.book}) : super(key: key);

  @override
  State<BookDetailPage> createState() => _BookDetailPageState();
}

class _BookDetailPageState extends State<BookDetailPage> {
  bool _isBookmarked = false;

  // Define our new color palette
  final Color primaryColor = const Color(0xFF0C1F47); // Blue
  final Color accentColor = const Color(0xFFF37D00); // Orange
  final Color secondaryColor = const Color(0xFF9FADFD); // Light Violet
  final Color backgroundColor = const Color(0xFFF2F3F4); // Antiwhite
  final Color textColor = const Color(0xFF0C1F47); // Using blue as text color
  final Color cardColor = Colors.white;

Future<void> _launchURL(BuildContext context, String urlString) async {
  try {
    // Clean and log the URL
    final cleanUrl = urlString.trim();
    print('Attempting to launch URL: $cleanUrl');
    
    // For FNAC URLs specifically, try an alternative approach
    if (cleanUrl.contains('fnac.com')) {
      // On Android, we'll try a different approach for FNAC URLs
      if (!kIsWeb && Platform.isAndroid) {
        // Try to use intent scheme for Android
        final intentUrl = 'intent://www.fnac.com${cleanUrl.split('fnac.com')[1]}#Intent;scheme=https;package=com.android.chrome;end';
        
        if (await canLaunchUrl(Uri.parse(intentUrl))) {
          await launchUrl(Uri.parse(intentUrl));
          return;
        } else {
          // Try a generic browser intent as fallback
          final fallbackUrl = 'https://www.google.com/search?q=${Uri.encodeComponent(cleanUrl)}';
          final fallbackUri = Uri.parse(fallbackUrl);
          
          if (await canLaunchUrl(fallbackUri)) {
            await launchUrl(fallbackUri, mode: LaunchMode.externalApplication);
            return;
          }
        }
      }
    }

    // Standard URL handling for all other cases
    final Uri url = Uri.parse(cleanUrl);
    
    // Try universal_html approach for web
    if (kIsWeb) {
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      } else {
        throw 'Could not launch $url on web';
      }
    } 
    // For mobile platforms
    else {
      // Try with forceWebView first
      bool launched = false;
      
      try {
        launched = await launchUrl(
          url,
          mode: LaunchMode.inAppWebView,
          webViewConfiguration: const WebViewConfiguration(
            enableJavaScript: true,
            enableDomStorage: true,
          ),
        );
      } catch (e) {
        print('In-app WebView launch failed: $e');
        launched = false;
      }
      
      // If in-app failed, try external app
      if (!launched) {
        try {
          launched = await launchUrl(
            url,
            mode: LaunchMode.externalApplication,
          );
        } catch (e) {
          print('External app launch failed: $e');
          launched = false;
        }
      }
      
      // Lastly, try platformDefault
      if (!launched) {
        try {
          launched = await launchUrl(
            url,
            mode: LaunchMode.platformDefault,
          );
        } catch (e) {
          print('Platform default launch failed: $e');
        }
      }
      
      if (!launched) {
        // Show user friendly message and offer a copy option
        _showUrlCopyDialog(context, cleanUrl);
      }
    }
  } catch (e) {
    print('Error launching URL: $e');
    // Show dialog with copy option instead of just a snackbar
    _showUrlCopyDialog(context, urlString);
  }
}

void _showUrlCopyDialog(BuildContext context, String url) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: const Text('Cannot open link'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'The app cannot open this link directly. Would you like to copy it to clipboard?',
            ),
            const SizedBox(height: 12),
            Text(
              url,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12,
                color: Colors.blue,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // Copy URL to clipboard
              Clipboard.setData(ClipboardData(text: url));
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('URL copied to clipboard'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Copy'),
          ),
        ],
      );
    },
  );
}

ImageProvider _getBookImage() {
  if (widget.book.imageURL == null || widget.book.imageURL!.isEmpty) {
    return const AssetImage('assets/defaultItemPic.png');
  }
  
  // Handle data URLs (base64 encoded images)
  if (widget.book.imageURL!.startsWith('data:')) {
    try {
      // Extract the base64 part from data URL
      final regex = RegExp(r'data:image/[^;]+;base64,(.*)');
      final match = regex.firstMatch(widget.book.imageURL!);
      
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
  return NetworkImage(widget.book.imageURL!);
}
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: CustomScrollView(
        slivers: [
          // App Bar with Book Image
          SliverAppBar(
            expandedHeight: 320.0,
            pinned: true,
            backgroundColor: primaryColor,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Book Cover Image
Hero(
  tag: 'book-image-${widget.book.id}',
  child: Container(
    decoration: BoxDecoration(
      image: DecorationImage(
        image: _getBookImage(),
        fit: BoxFit.contain,  // Changed from BoxFit.cover to BoxFit.contain
        alignment: Alignment.center,
      ),
      color: Colors.black.withOpacity(0.3), // Optional background color
    ),
  ),
),
                  // Gradient Overlay
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          primaryColor.withOpacity(0.1),
                          primaryColor.withOpacity(0.5),
                          primaryColor.withOpacity(0.8),
                        ],
                        stops: const [0.4, 0.65, 0.8, 1.0],
                      ),
                    ),
                  ),
                  // Book Title at bottom
                  Positioned(
                    left: 20,
                    right: 20,
                    bottom: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          widget.book.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            shadows: [
                              Shadow(
                                blurRadius: 4,
                                color: Colors.black45,
                                offset: Offset(0, 2),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'by ${widget.book.author}',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 16,
                            shadows: const [
                              Shadow(
                                blurRadius: 3,
                                color: Colors.black38,
                                offset: Offset(0, 1),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            leading: GestureDetector(
              onTap: () => Navigator.of(context).pop(),
              child: Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Icon(Icons.arrow_back, color: primaryColor),
              ),
            ),

          ),

          // Book Details
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Availability Status Card
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
                  child: Container(
                    padding: const EdgeInsets.all(16),
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
                      border: Border.all(
                        color: widget.book.availableCopies > 0
                            ? Colors.green.withOpacity(0.3)
                            : Colors.red.withOpacity(0.3),
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: widget.book.availableCopies > 0
                                ? Colors.green.withOpacity(0.15)
                                : Colors.red.withOpacity(0.15),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Icon(
                              widget.book.availableCopies > 0
                                  ? Icons.check_circle_outline
                                  : Icons.timer,
                              size: 32,
                              color: widget.book.availableCopies > 0
                                  ? Colors.green[700]
                                  : Colors.red[700],
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.book.availableCopies > 0
                                    ? 'Available Now'
                                    : 'Currently Unavailable',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: widget.book.availableCopies > 0
                                      ? Colors.green[700]
                                      : Colors.red[700],
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                '${widget.book.availableCopies} of ${widget.book.totalCopies} copies available',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: textColor.withOpacity(0.7),
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (widget.book.availableCopies <= 0)
                          ElevatedButton(
                            onPressed: () async {
                              // Get the AuthService from the provider
                              final authService = Provider.of<AuthService>(
                                  context,
                                  listen: false);

                              // Check if user is authenticated
                              if (!authService.isAuthenticated) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                        'You need to login first to reserve books.'),
                                    backgroundColor: Colors.red.shade700,
                                    duration: Duration(seconds: 3),
                                  ),
                                );
                                return;
                              }

                              // Create a new ReservationService instance
                              final reservationService =
                                  ReservationService(authService);

                              // Show loading indicator
                              showDialog(
                                context: context,
                                barrierDismissible: false,
                                builder: (context) => Center(
                                  child: CircularProgressIndicator(
                                    color: accentColor,
                                  ),
                                ),
                              );

                              try {
                                // Call the reservation service
                                final result =
                                    await reservationService.createReservation(
                                  widget.book.id,
                                  daysUntilExpiry: 3, // Default value is 3 days
                                );

                                // Pop the loading dialog
                                Navigator.pop(context);

                                if (result['success']) {
                                  // Show success message
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(result['message']),
                                      backgroundColor: Colors.green.shade700,
                                      duration: Duration(seconds: 3),
                                    ),
                                  );
                                } else {
                                  // Show error message
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(result['message']),
                                      backgroundColor: Colors.red.shade700,
                                      duration: Duration(seconds: 3),
                                    ),
                                  );
                                }
                              } catch (e) {
                                // Pop the loading dialog
                                Navigator.pop(context);

                                // Show error message
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                        'Failed to create reservation: $e'),
                                    backgroundColor: Colors.red.shade700,
                                    duration: Duration(seconds: 3),
                                  ),
                                );
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: accentColor,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 20, vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 2,
                            ),
                            child: const Text(
                              'Reserve',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          )
                      ],
                    ),
                  ),
                ),

                // Details Card
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                  child: Container(
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
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Summary Section
                        if (widget.book.summary != null &&
                            widget.book.summary!.isNotEmpty)
                          _buildSection(
                            icon: Icons.description,
                            title: 'Summary',
                            content: widget.book.summary!,
                          ),

                        // Divider between sections
                        if ((widget.book.summary != null &&
                                widget.book.summary!.isNotEmpty) &&
                            ((widget.book.barcode != null &&
                                    widget.book.barcode!.isNotEmpty) ||
                                (widget.book.keywords != null &&
                                    widget.book.keywords!.isNotEmpty) ||
                                (widget.book.ebookLink != null &&
                                    widget.book.ebookLink!.isNotEmpty)))
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: Divider(
                              color: Colors.grey.withOpacity(0.3),
                              thickness: 1,
                            ),
                          ),

                        // Barcode Section
                        if (widget.book.barcode != null &&
                            widget.book.barcode!.isNotEmpty)
                          _buildSection(
                            icon: Icons.qr_code,
                            title: 'Barcode',
                            content: widget.book.barcode!,
                            isShort: true,
                          ),

                        // Divider between sections
                        if ((widget.book.barcode != null &&
                                widget.book.barcode!.isNotEmpty) &&
                            ((widget.book.keywords != null &&
                                    widget.book.keywords!.isNotEmpty) ||
                                (widget.book.ebookLink != null &&
                                    widget.book.ebookLink!.isNotEmpty)))
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: Divider(
                              color: Colors.grey.withOpacity(0.3),
                              thickness: 1,
                            ),
                          ),

                        // Keywords Section
                        if (widget.book.keywords != null &&
                            widget.book.keywords!.isNotEmpty)
                          _buildKeywordsSection(widget.book.keywords!),

                        // Divider between sections
                        if ((widget.book.keywords != null &&
                                widget.book.keywords!.isNotEmpty) &&
                            (widget.book.ebookLink != null &&
                                widget.book.ebookLink!.isNotEmpty))
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: Divider(
                              color: Colors.grey.withOpacity(0.3),
                              thickness: 1,
                            ),
                          ),

                        // E-book Link Section
                        if (widget.book.ebookLink != null &&
                            widget.book.ebookLink!.isNotEmpty)
                          _buildEbookSection(widget.book.ebookLink!),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required IconData icon,
    required String title,
    required String content,
    bool isShort = false,
  }) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: primaryColor, size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            content,
            style: TextStyle(
              fontSize: 16,
              color: textColor,
              height: 1.5,
            ),
            maxLines: isShort ? 1 : null,
            overflow: isShort ? TextOverflow.ellipsis : null,
          ),
          if (!isShort) const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildKeywordsSection(String keywords) {
    final keywordsList = keywords.split(',').map((k) => k.trim()).toList();

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.label, color: primaryColor, size: 20),
              const SizedBox(width: 8),
              Text(
                'Keywords',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: keywordsList.map((keyword) {
              return Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: accentColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  keyword,
                  style: TextStyle(
                    color: primaryColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

Widget _buildEbookSection(String ebookLink) {
  return Padding(
    padding: const EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.book_online, color: primaryColor, size: 20),
            const SizedBox(width: 8),
            Text(
              'E-Book',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ElevatedButton.icon(
          icon: const Icon(Icons.open_in_new),
          label: const Text('View E-Book'),
          onPressed: () {
            _launchURL(context, ebookLink);
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: accentColor,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
        ),
      ],
    ),
  );
}
}
