import 'package:flutter/material.dart';
import '../models/child_profile.dart';
import '../widgets/custom_button.dart';
import '../repositories/profile_repository.dart';

class AddChildScreen extends StatefulWidget {
  const AddChildScreen({super.key});

  @override
  State<AddChildScreen> createState() => _AddChildScreenState();
}

class _AddChildScreenState extends State<AddChildScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _ageController = TextEditingController();
  final _gradeController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Child Profile')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: 'Child\'s Name',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  validator: (value) => value == null || value.isEmpty ? 'Please enter a name' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _ageController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Age',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) return 'Please enter an age';
                    if (int.tryParse(value) == null) return 'Please enter a valid number';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _gradeController,
                  decoration: InputDecoration(
                    labelText: 'Class / Grade',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  validator: (value) => value == null || value.isEmpty ? 'Please enter a grade' : null,
                ),
                const Spacer(),
                if (_isLoading)
                  const Center(child: CircularProgressIndicator())
                else
                  CustomButton(
                    text: 'Save Profile',
                    onPressed: () async {
                      if (_formKey.currentState!.validate()) {
                        setState(() => _isLoading = true);
                        final newChild = ChildProfile(
                          id: (DateTime.now().millisecondsSinceEpoch % 10000).toString(),
                          name: _nameController.text,
                          age: int.parse(_ageController.text),
                          grade: _gradeController.text,
                          language: 'English',
                        );
                        await ProfileRepository().addChild(newChild);
                        if (context.mounted) {
                          Navigator.pop(context);
                        }
                      }
                    },
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
