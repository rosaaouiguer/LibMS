import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class HelpCenterPage extends StatelessWidget {
  const HelpCenterPage({Key? key}) : super(key: key);

  // Color palette
  final Color primaryColor = const Color(0xFF0C1F47); // Blue
  final Color accentColor = const Color(0xFFF37D00); // Orange
  final Color secondaryColor = const Color(0xFF9FADFD); // Light Violet
  final Color backgroundColor = const Color(0xFFF2F3F4); // Antiwhite
  final Color textColor = const Color(0xFF0C1F47); // Using blue as text color
  final Color cardColor = Colors.white;

  // Function to launch URL
  Future<void> _launchUrl(Uri url) async {
    if (!await launchUrl(url)) {
      throw Exception('Could not launch $url');
    }
  }

  // Function to make a phone call
  void _makePhoneCall(String phoneNumber) async {
    final Uri phoneUri = Uri(scheme: 'tel', path: phoneNumber);
    await _launchUrl(phoneUri);
  }

  // Function to send an email
  void _sendEmail(String email) async {
    final Uri emailUri = Uri(
      scheme: 'mailto',
      path: email,
      query: 'subject=Help%20Request&body=Hello,%20I%20need%20assistance%20with%20',
    );
    await _launchUrl(emailUri);
  }

  Widget _buildContactCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color iconBgColor = const Color(0xFF9FADFD),
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 2,
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: iconBgColor.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  color: iconBgColor,
                  size: 28,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: TextStyle(
                  color: textColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 13,
                  color: textColor.withOpacity(0.6),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        backgroundColor: primaryColor,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          // Header Section
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            decoration: BoxDecoration(
              color: primaryColor,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Need some help?',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Our support team is ready to assist you with any questions or issues you might have.',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: accentColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.access_time, color: accentColor, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        '24/7 Support Available',
                        style: TextStyle(
                          color: accentColor,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // Contact Options
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: GridView.count(
                crossAxisCount: 2,
                childAspectRatio: 0.9,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                children: [
                  // Email Option
                  _buildContactCard(
                    icon: Icons.email_outlined,
                    title: 'Email Us',
                    subtitle: 'Get a response within 24 hours',
                    onTap: () => _sendEmail('ghanima.hamdoune@ensia.edu.dz'),
                    iconBgColor: secondaryColor,
                  ),
                  
                  // Phone Option
                  _buildContactCard(
                    icon: Icons.phone_outlined,
                    title: 'Call Us',
                    subtitle: 'Speak directly with our team',
                    onTap: () => _makePhoneCall('+213'),
                    iconBgColor: accentColor,
                  ),
                  
                  // FAQ Option
                  _buildContactCard(
                    icon: Icons.help_outline,
                    title: 'FAQs',
                    subtitle: 'Find answers to common questions',
                    onTap: () {},
                    iconBgColor: primaryColor,
                  ),
                  
                  // Chat Option
                  // _buildContactCard(
                  //   icon: Icons.chat_outlined,
                  //   title: 'Live Chat',
                  //   subtitle: 'Instant messaging support',
                  //   onTap: () {},
                  //   iconBgColor: accentColor,
                  // ),
                ],
              ),
            ),
          ),
          // Bottom Info
          Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'We typically respond within 1-2 business days',
              style: TextStyle(
                color: textColor.withOpacity(0.6),
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}