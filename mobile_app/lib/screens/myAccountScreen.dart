import 'package:flutter/material.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../styles/app_theme.dart';
import '../services/student_service.dart';
import '../models/student_model.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

class MyAccountScreen extends StatefulWidget {
  final String mongoId; // Changed from studentId to mongoId
  
  const MyAccountScreen({Key? key, required this.mongoId}) : super(key: key);

  @override
  State<MyAccountScreen> createState() => _MyAccountScreenState();
}

class _MyAccountScreenState extends State<MyAccountScreen> {
  // Controllers for text fields
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _currentPasswordController = TextEditingController();
final TextEditingController _newPasswordController = TextEditingController();
final TextEditingController _confirmPasswordController = TextEditingController();
bool _passwordChangeLoading = false;
  
  // For profile image
  File? _imageFile;
  String? _networkImageUrl;
  final ImagePicker _picker = ImagePicker();
  late StudentService _studentService;
  
  bool _isLoading = true;
  bool _isSaving = false;
  Student? _student;

  @override
  void initState() {
    super.initState();
    // Get the AuthService from provider
    final authService = Provider.of<AuthService>(context, listen: false);
    _studentService = StudentService(authService);
    _loadStudentData();
  }

  Future<void> _loadStudentData() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // Using getStudentById with mongoId (MongoDB _id)
      final student = await _studentService.getStudentById(widget.mongoId);
      setState(() {
        _student = student;
        _nameController.text = student.name;
        _emailController.text = student.email;
        _phoneController.text = student.phoneNumber;
        _networkImageUrl = student.image.startsWith('http') || student.image.startsWith('/uploads') 
            ? 'https://lms-backend-zjt1.onrender.com/api/${student.image}' 
            : null;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading data: $e')),
      );
    }
  }

@override
void dispose() {
  _nameController.dispose();
  _emailController.dispose();
  _phoneController.dispose();
  _currentPasswordController.dispose();
  _newPasswordController.dispose();
  _confirmPasswordController.dispose();
  super.dispose();
}

  // Method to pick image from gallery
  Future<void> _pickImage() async {
    try {
      final XFile? pickedFile = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );
      if (pickedFile != null) {
        setState(() {
          _imageFile = File(pickedFile.path);
        });
      }
    } catch (e) {
      // Handle any errors
      print("Error picking image: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error selecting image: $e')),
      );
    }
  }

// Add this validation function to your class
String? _validatePhoneNumber(String? value) {
  if (value == null || value.isEmpty) {
    return 'Phone number is required';
  }

  // For numbers starting with 0
  if (value.startsWith('0')) {
    if (value.length != 10) {
      return 'Phone number must be 10 digits when starting with 0';
    }
    
    if (!['5', '6', '7'].contains(value[1])) {
      return 'After 0, the next digit must be 5, 6, or 7';
    }
  }
  // For numbers starting with +213
  else if (value.startsWith('+213')) {
    // Case 1: +213 followed by a number starting with 0 (total length 13)
    if (value.length == 14 && value[4] == '0') {
      if (!['5', '6', '7'].contains(value[5])) {
        return 'After +2130, the next digit must be 5, 6, or 7';
      }
    }
    // Case 2: +213 followed directly by 5, 6, or 7 (total length 12)
    else if (value.length == 13) {
      if (!['5', '6', '7'].contains(value[4])) {
        return 'After +213, the next digit must be 5, 6, or 7';
      }
    }
    else {
      return 'Phone number with +213 must be either 9 or 10 digits';
    }
  }
  else {
    return 'Phone number must start with 0 or +213';
  }

  // If all validations pass
  return null;
}

  // Method to save profile changes
  Future<void> _saveChanges() async {
    if (_student == null) return;
    
  // Validate phone number before saving
  String? phoneValidationError = _validatePhoneNumber(_phoneController.text);
  if (phoneValidationError != null) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(phoneValidationError),
        backgroundColor: Colors.red,
      ),
    );
    return;
  }
  
  setState(() {
    _isSaving = true;
  });
    
    try {
      // First update basic info
      final updatedData = {
        'name': _nameController.text,
        'email': _emailController.text,
        'phoneNumber': _phoneController.text,
      };
      
      // Then update student profile - using mongoId
      Student updatedStudent;
      
      // If image was changed, update it separately
      if (_imageFile != null) {
        updatedStudent = await _studentService.updateStudentImage(
          widget.mongoId, // Using mongoId 
          _imageFile!.path
        );
      } else {
        updatedStudent = await _studentService.updateStudent(
          widget.mongoId, // Using mongoId
          updatedData
        );
      }
      
      setState(() {
        _student = updatedStudent;
        _isSaving = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully!'),
          backgroundColor: AppTheme.accentColor,
        ),
      );
      
    } catch (e) {
      setState(() {
        _isSaving = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error updating profile: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

Future<void> _changePassword() async {
  // Basic validation
  if (_currentPasswordController.text.isEmpty ||
      _newPasswordController.text.isEmpty ||
      _confirmPasswordController.text.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('All fields are required')),
    );
    return;
  }

  if (_newPasswordController.text != _confirmPasswordController.text) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('New passwords do not match')),
    );
    return;
  }

  // Password complexity check
  if (_newPasswordController.text.length < 6) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Password must be at least 6 characters')),
    );
    return;
  }

  setState(() {
    _passwordChangeLoading = true;
  });

  try {
    await _studentService.changePassword(
      widget.mongoId,
      _currentPasswordController.text,
      _newPasswordController.text,
    );

    // Clear the fields
    _currentPasswordController.clear();
    _newPasswordController.clear();
    _confirmPasswordController.clear();

    Navigator.of(context).pop(); // Close the dialog

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Password updated successfully!'),
        backgroundColor: AppTheme.accentColor,
      ),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Error: ${e.toString()}'),
        backgroundColor: Colors.red,
      ),
    );
  } finally {
    setState(() {
      _passwordChangeLoading = false;
    });
  }
}
void _showChangePasswordDialog() {
  // Reset controllers
  _currentPasswordController.clear();
  _newPasswordController.clear();
  _confirmPasswordController.clear();
  
  // Password visibility toggles and state variables
  bool _obscureCurrentPassword = true;
  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;
  bool _passwordChangeLoading = false;
  String? _errorMessage;
  String? _successMessage;
  
  showDialog(
    context: context,
    barrierDismissible: false, // Prevent dismissing by tapping outside
    builder: (BuildContext context) {
      return StatefulBuilder(
        builder: (context, setState) {
          
          // Handle password change within the dialog
          Future<void> _handlePasswordChange() async {
            // Reset messages
            setState(() {
              _errorMessage = null;
              _successMessage = null;
            });
            
            // Basic validation
            if (_currentPasswordController.text.isEmpty ||
                _newPasswordController.text.isEmpty ||
                _confirmPasswordController.text.isEmpty) {
              setState(() {
                _errorMessage = 'All fields are required';
              });
              return;
            }

            if (_newPasswordController.text != _confirmPasswordController.text) {
              setState(() {
                _errorMessage = 'New passwords do not match';
              });
              return;
            }

            // Password complexity check
            if (_newPasswordController.text.length < 6) {
              setState(() {
                _errorMessage = 'Password must be at least 6 characters';
              });
              return;
            }

            setState(() {
              _passwordChangeLoading = true;
            });

            try {
              await _studentService.changePassword(
                widget.mongoId,
                _currentPasswordController.text,
                _newPasswordController.text,
              );

              // Clear the fields and show success
              setState(() {
                _currentPasswordController.clear();
                _newPasswordController.clear();
                _confirmPasswordController.clear();
                _successMessage = 'Password changed successfully!';
                _passwordChangeLoading = false;
              });
              
              // Auto-close dialog after success (optional)
              Future.delayed(const Duration(seconds: 2), () {
                if (mounted && Navigator.of(context).canPop()) {
                  Navigator.of(context).pop();
                }
              });
              
            } catch (e) {
              setState(() {
                _errorMessage = e.toString().contains('incorrect') 
                    ? 'Current password is incorrect' 
                    : 'Error: ${e.toString()}';
                _passwordChangeLoading = false;
              });
            }
          }
          
          return Dialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            elevation: 0,
            backgroundColor: Colors.transparent,
            child: SingleChildScrollView(
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header with icon
                    Container(
                      padding: const EdgeInsets.all(15),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.lock_outlined,
                        color: Colors.white,
                        size: 30,
                      ),
                    ),
                    const SizedBox(height: 15),
                    
                    // Title
                    const Text(
                      'Change Password',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    
                    // Description
                    const Text(
                      'Enter your current password and choose a new secure password',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Success message (if any)
                    if (_successMessage != null)
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.green.shade200),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.check_circle, color: Colors.green.shade700, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                _successMessage!,
                                style: TextStyle(color: Colors.green.shade700),
                              ),
                            ),
                          ],
                        ),
                      ),
                    
                    // Error message (if any)
                    if (_errorMessage != null)
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.error_outline, color: Colors.red.shade700, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: TextStyle(color: Colors.red.shade700),
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                    const SizedBox(height: 16),
                    
                    // Current Password Field
                    TextField(
                      controller: _currentPasswordController,
                      obscureText: _obscureCurrentPassword,
                      decoration: InputDecoration(
                        labelText: 'Current Password',
                        filled: true,
                        fillColor: Colors.grey.shade50,
                        prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.primaryColor),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureCurrentPassword ? Icons.visibility_off : Icons.visibility,
                            color: Colors.grey,
                          ),
                          onPressed: () {
                            setState(() {
                              _obscureCurrentPassword = !_obscureCurrentPassword;
                            });
                          },
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppTheme.accentColor, width: 2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // New Password Field
                    TextField(
                      controller: _newPasswordController,
                      obscureText: _obscureNewPassword,
                      decoration: InputDecoration(
                        labelText: 'New Password',
                        filled: true,
                        fillColor: Colors.grey.shade50,
                        prefixIcon: const Icon(Icons.vpn_key_outlined, color: AppTheme.primaryColor),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureNewPassword ? Icons.visibility_off : Icons.visibility,
                            color: Colors.grey,
                          ),
                          onPressed: () {
                            setState(() {
                              _obscureNewPassword = !_obscureNewPassword;
                            });
                          },
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppTheme.accentColor, width: 2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Confirm Password Field
                    TextField(
                      controller: _confirmPasswordController,
                      obscureText: _obscureConfirmPassword,
                      decoration: InputDecoration(
                        labelText: 'Confirm New Password',
                        filled: true,
                        fillColor: Colors.grey.shade50,
                        prefixIcon: const Icon(Icons.check_circle_outline, color: AppTheme.primaryColor),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
                            color: Colors.grey,
                          ),
                          onPressed: () {
                            setState(() {
                              _obscureConfirmPassword = !_obscureConfirmPassword;
                            });
                          },
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppTheme.accentColor, width: 2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Buttons
                    Row(
                      children: [
                        // Cancel Button
                        Expanded(
                          child: TextButton(
                            onPressed: () => Navigator.of(context).pop(),
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: const Text(
                              'Cancel',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: Colors.grey,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        
                        // Update Button
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _passwordChangeLoading ? null : _handlePasswordChange,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.accentColor,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: _passwordChangeLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Text(
                                    'Update',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      );
    },
  );
}
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text(
          'My Account',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: AppTheme.primaryColor,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: AppTheme.accentColor,
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Profile Image Section with background flair
                  Container(
                    padding: const EdgeInsets.only(bottom: 30),
                    decoration: const BoxDecoration(
                      color: AppTheme.primaryColor,
                      borderRadius: BorderRadius.only(
                        bottomLeft: Radius.circular(30),
                        bottomRight: Radius.circular(30),
                      ),
                    ),
                    child: Center(
                      child: Column(
                        children: [
                          const SizedBox(height: 20),
                          // Profile Image with border
                          Stack(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: AppTheme.accentColor,
                                    width: 2,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.2),
                                      spreadRadius: 2,
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: CircleAvatar(
                                  radius: 60,
                                  backgroundColor: AppTheme.secondaryColor.withOpacity(0.3),
                                  backgroundImage: _imageFile != null
                                      ? FileImage(_imageFile!) as ImageProvider
                                      : _networkImageUrl != null
                                          ? NetworkImage(_networkImageUrl!) as ImageProvider
                                          : null,
                                  child: (_imageFile == null && _networkImageUrl == null)
                                      ? const Icon(
                                          Icons.person,
                                          size: 60,
                                          color: Colors.white,
                                        )
                                      : null,
                                ),
                              ),
                              // Edit Icon overlay on the image
                              Positioned(
                                right: 0,
                                bottom: 0,
                                child: GestureDetector(
                                  onTap: _pickImage,
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: AppTheme.accentColor,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: Colors.white, width: 2),
                                    ),
                                    child: const Icon(
                                      Icons.camera_alt,
                                      color: Colors.white,
                                      size: 18,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 15),
                          // Change Picture Button
                          TextButton.icon(
                            onPressed: _pickImage,
                            icon: const Icon(
                              Icons.photo_library_rounded,
                              color: AppTheme.accentColor,
                            ),
                            label: const Text(
                              'Change Picture',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Form Fields in Cards
                  Container(
                    decoration: AppTheme.cardDecoration,
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Personal Information',
                          style: AppTheme.subheadingStyle,
                        ),
                        const SizedBox(height: 16),
                        
                        // Name Field
                        _buildFormField(
                          label: 'Name',
                          controller: _nameController,
                          icon: Icons.person,
                        ),
                        const SizedBox(height: 20),
                        
                        // Email Field
                        _buildFormField(
                          label: 'Email',
                          controller: _emailController,
                          icon: Icons.email,
                          keyboardType: TextInputType.emailAddress,
                        ),
                        const SizedBox(height: 20),
                        
                        // Phone Number Field
_buildFormField(
  label: 'Phone Number',
  controller: _phoneController,
  icon: Icons.phone,
  keyboardType: TextInputType.phone,
  validator: _validatePhoneNumber,
),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Additional Card for Category Information (read-only)
                  if (_student != null)
                    Container(
                      decoration: AppTheme.cardDecoration,
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Membership Details',
                            style: AppTheme.subheadingStyle,
                          ),
                          const SizedBox(height: 16),
                          
                          _buildInfoRow(
                            icon: Icons.badge,
                            label: 'Student ID',
                            value: _student!.studentId,
                          ),
                          const Divider(height: 24),
                          
                          _buildInfoRow(
                            icon: Icons.category,
                            label: 'Category',
                            value: _student!.category.name,
                          ),
                          const Divider(height: 24),
                          
                          _buildInfoRow(
                            icon: Icons.book,
                            label: 'Book Limit',
                            value: _student!.category.borrowingLimit.toString(),
                          ),
                          
                          if (_student!.category.loanExtensionAllowed)
                            Column(
                              children: [
                                const Divider(height: 24),
                                _buildInfoRow(
                                  icon: Icons.extension,
                                  label: 'Extension Limit',
                                  value: _student!.category.extensionLimit.toString(),
                                ),
                              ],
                            ),
                        ],
                      ),
                    ),
                  
                  const SizedBox(height: 24),
                  
                  // Change Password Button
                  Container(
                    width: double.infinity,
                    decoration: AppTheme.cardDecoration,
                    child: InkWell(
onTap: () => _showChangePasswordDialog(),
                      borderRadius: BorderRadius.circular(16),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppTheme.secondaryColor.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.lock,
                                color: AppTheme.primaryColor,
                              ),
                            ),
                            const SizedBox(width: 16),
                            const Text(
                              'Change Password',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                                color: AppTheme.primaryColor,
                              ),
                            ),
                            const Spacer(),
                            const Icon(
                              Icons.chevron_right,
                              color: AppTheme.secondaryColor,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Save Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _saveChanges,
                      style: AppTheme.accentButtonStyle,
                      child: _isSaving
                          ? const SizedBox(
                              height: 24,
                              width: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text(
                              'Save Changes',
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
    );
  }

  // Helper method to build form fields
// Modify your _buildFormField method to include validation
Widget _buildFormField({
  required String label,
  required TextEditingController controller,
  required IconData icon,
  TextInputType keyboardType = TextInputType.text,
  String? Function(String?)? validator, // Add this parameter
}) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        label,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Colors.grey,
        ),
      ),
      const SizedBox(height: 8),
      TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        validator: validator, // Add this line
        decoration: InputDecoration(
          filled: true,
          fillColor: Colors.grey.shade50,
          prefixIcon: Icon(icon, color: AppTheme.primaryColor),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppTheme.accentColor, width: 2),
          ),
          errorBorder: OutlineInputBorder( // Add this
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.red, width: 1),
          ),
          focusedErrorBorder: OutlineInputBorder( // Add this
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.red, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        onChanged: (value) { // Optional: Add this for real-time validation
          if (validator != null) {
            setState(() {
              // This will trigger a rebuild to show/hide error
            });
          }
        },
      ),
      if (validator != null && validator(controller.text) != null)
        Padding(
          padding: const EdgeInsets.only(top: 6.0, left: 12.0),
          child: Text(
            validator(controller.text) ?? '',
            style: TextStyle(color: Colors.red, fontSize: 12),
          ),
        ),
    ],
  );
}

  // Helper method to build info rows
  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.secondaryColor.withOpacity(0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            color: AppTheme.primaryColor,
            size: 20,
          ),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
            Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: AppTheme.textColor,
              ),
            ),
          ],
        ),
      ],
    );
  }
}