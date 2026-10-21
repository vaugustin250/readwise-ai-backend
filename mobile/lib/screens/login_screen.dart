import 'package:flutter/material.dart';
import '../repositories/auth_repository.dart';
import '../widgets/custom_button.dart';
import '../widgets/clay_3d_button.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'parent@example.com');
  final _passwordController = TextEditingController(text: 'ReadWise123!');
  bool _isLoading = false;

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final success = await AuthRepository().login(
      _emailController.text,
      _passwordController.text,
    );

    setState(() => _isLoading = false);

    if (mounted) {
      if (success) {
        Navigator.pushReplacementNamed(context, '/dashboard');
      } else {
        final errMsg = AuthRepository().lastErrorMessage ?? 'Invalid credentials. If this is your first time, tap "Create Account".';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errMsg),
            backgroundColor: const Color(0xFFE11D48),
          ),
        );
      }
    }
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final success = await AuthRepository().register(
      _emailController.text,
      _passwordController.text,
    );

    setState(() => _isLoading = false);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Account created successfully! Welcome to ReadWise AI.'),
            backgroundColor: Color(0xFF059669),
          ),
        );
        Navigator.pushReplacementNamed(context, '/dashboard');
      } else {
        final errMsg = AuthRepository().lastErrorMessage ?? 'Registration failed. Please check network connection or try a different email.';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errMsg),
            backgroundColor: const Color(0xFFE11D48),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFFDF5),
      appBar: AppBar(title: const Text('Parent Login')),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Center(
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE0F2FE),
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF0284C7), width: 2.5),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x220369A1),
                            offset: Offset(0, 4),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text('🌟', style: TextStyle(fontSize: 32)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Sign In',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 26),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Log in or register your guardian account to securely manage child profiles and screening assessments.',
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade700, fontWeight: FontWeight.w500),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 28),
                  TextFormField(
                    controller: _emailController,
                    decoration: InputDecoration(
                      labelText: 'Guardian Email',
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1), width: 1.5),
                      ),
                      prefixIcon: const Icon(Icons.email_outlined),
                    ),
                    validator: (val) => (val == null || !val.contains('@')) ? 'Enter a valid email' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Secret Password',
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1), width: 1.5),
                      ),
                      prefixIcon: const Icon(Icons.lock_outline),
                    ),
                    validator: (val) => (val == null || val.length < 6) ? 'Password must be at least 6 characters' : null,
                  ),
                  const SizedBox(height: 28),
                  if (_isLoading)
                    const Center(child: CircularProgressIndicator())
                  else ...[
                    CustomButton(
                      text: 'Login',
                      onPressed: _handleLogin,
                    ),
                    const SizedBox(height: 14),
                    CustomButton(
                      text: 'Create Account',
                      isSecondary: true,
                      onPressed: _handleRegister,
                    ),
                  ],
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.5)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.shield_outlined, size: 16, color: Color(0xFF92400E)),
                        SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            'Child data privacy protected. Screenings are non-diagnostic.',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF92400E)),
                            textAlign: TextAlign.center,
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
      ),
    );
  }
}
