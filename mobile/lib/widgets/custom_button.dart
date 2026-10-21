import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isSecondary;

  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isSecondary = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: isSecondary ? Colors.white : Theme.of(context).primaryColor,
          foregroundColor: isSecondary ? Theme.of(context).primaryColor : Colors.white,
          side: isSecondary ? BorderSide(color: Theme.of(context).primaryColor, width: 2) : null,
        ),
        onPressed: onPressed,
        child: Text(text),
      ),
    );
  }
}
