import 'package:flutter/material.dart';
import 'package:library_app/screens/mainScreen.dart';
import 'package:library_app/styles/app_theme.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart'; 
import '../services/auth_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> with SingleTickerProviderStateMixin {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;
  bool _isLoading = false;
  String _errorMessage = '';
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );
    
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _animationController.dispose();
    super.dispose();
  }

Future<void> _handleLogin() async {
  if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
    setState(() {
      _errorMessage = 'Please enter both email and password';
    });
    return;
  }

  setState(() {
    _isLoading = true;
    _errorMessage = '';
  });

  final authService = Provider.of<AuthService>(context, listen: false);
  
  final result = await authService.login(
    _emailController.text.trim(), 
    _passwordController.text
  );
  
  if (!mounted) return;
  
  setState(() {
    _isLoading = false;
    if (result['success']) {
      _errorMessage = '';
    } else {
      _errorMessage = result['message'];
    }
  });

  if (result['success']) {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const MainScreen())
    );
  }
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
      ),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: SlideTransition(
            position: _slideAnimation,
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 20),
                  // Logo placeholder
                  Container(
                    height: 100,
                    width: 100,
                    margin: const EdgeInsets.only(bottom: 24),
                    decoration: BoxDecoration(
                      color: AppTheme.secondaryColor.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.auto_stories,
                      size: 50,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  Text(
                    'Welcome Back',
                    style: AppTheme.headingStyle,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Sign in to continue to your library',
                    style: AppTheme.captionStyle,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
                  
                  // Error message display
                  if (_errorMessage.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.all(10),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.red.shade200),
                      ),
                      child: Text(
                        _errorMessage,
                        style: TextStyle(color: Colors.red.shade800),
                      ),
                    ),
                  
                  // Email Field
                  Text(
                    'Email',
                    style: AppTheme.bodyStyle.copyWith(fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    cursorColor: AppTheme.primaryColor,
                    decoration: AppTheme.inputDecoration('Your email')
                      .copyWith(
                        prefixIcon: Icon(Icons.email_outlined, color: AppTheme.primaryColor),
                      ),
                  ),
                  const SizedBox(height: 20),
                  // Password Field
                  Text(
                    'Password',
                    style: AppTheme.bodyStyle.copyWith(fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _passwordController,
                    obscureText: !_isPasswordVisible,
                    cursorColor: AppTheme.primaryColor,
                    decoration: AppTheme.inputDecoration('Your password')
                      .copyWith(
                        prefixIcon: Icon(Icons.lock_outline, color: AppTheme.primaryColor),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
                            color: AppTheme.primaryColor,
                          ),
                          onPressed: () {
                            setState(() {
                              _isPasswordVisible = !_isPasswordVisible;
                            });
                          },
                        ),
                      ),
                  ),
                  // Align(
                  //   alignment: Alignment.centerRight,
                  //   child: TextButton(
                  //     onPressed: () {
                  //       // Handle forgot password
                  //     },
                  //     style: TextButton.styleFrom(
                  //       foregroundColor: AppTheme.accentColor,
                  //       padding: EdgeInsets.zero,
                  //       minimumSize: const Size(0, 36),
                  //       tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  //     ),
                  //     child: Text(
                  //       'Forgot Password?',
                  //       style: TextStyle(
                  //         color: AppTheme.accentColor,
                  //         fontWeight: FontWeight.w600,
                  //       ),
                  //     ),
                  //   ),
                  // ),
                  const SizedBox(height: 32),
                  // Login Button
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    style: AppTheme.primaryButtonStyle,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 3,
                              ),
                            )
                          : Text(
                              'LOGIN', 
                              style: AppTheme.bodyStyle.copyWith(
                                color: Colors.white, 
                                fontWeight: FontWeight.bold
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(height: 24),
                  // Divider
                  // Row(
                  //   children: [
                  //     Expanded(
                  //       child: Divider(color: Colors.grey.shade400),
                  //     ),
                  //     Padding(
                  //       padding: const EdgeInsets.symmetric(horizontal: 16),
                  //       child: Text(
                  //         'Or continue with',
                  //         style: AppTheme.captionStyle,
                  //       ),
                  //     ),
                  //     Expanded(
                  //       child: Divider(color: Colors.grey.shade400),
                  //     ),
                  //   ],
                  // ),
                  // const SizedBox(height: 24),
                  // // Google Sign In Button
                  // OutlinedButton.icon(
                  //   icon: Padding(
                  //     padding: const EdgeInsets.only(right: 8.0),
                  //     child: Image.asset(
                  //       'assets/google.png',
                  //       height: 20,
                  //       width: 20,
                  //     ),
                  //   ),
                  //   label: Text(
                  //     'Sign in with Google',
                  //     style: AppTheme.bodyStyle.copyWith(
                  //       fontWeight: FontWeight.w500,
                  //     ),
                  //   ),
                  //   onPressed: () {
                  //     // Handle Google sign-in
                  //   },
                  //   style: AppTheme.outlineButtonStyle,
                  // ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}