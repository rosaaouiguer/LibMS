import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/signin.dart';
import 'screens/mainScreen.dart';
import 'services/auth_service.dart';

void main() {
  // Ensure Flutter bindings are initialized
  WidgetsFlutterBinding.ensureInitialized();
  
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => AuthService(),
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        home: AuthCheckPage(),
        routes: {
          '/main': (context) => const MainScreen(),
          '/login': (context) => const LoginPage(),
        },
      ),
    );
  }
}

class AuthCheckPage extends StatefulWidget {
  @override
  _AuthCheckPageState createState() => _AuthCheckPageState();
}

// Replace the _AuthCheckPageState class in main.dart with this:

class _AuthCheckPageState extends State<AuthCheckPage> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final isAuthenticated = await authService.checkAuthStatus();
    
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
      
      if (isAuthenticated) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const MainScreen())
        );
      } else {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const LoginPage())
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: _isLoading 
          ? Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Checking login status...')
              ],
            )
          : Container(), // This will never be shown as we navigate away
      ),
    );
  }
}