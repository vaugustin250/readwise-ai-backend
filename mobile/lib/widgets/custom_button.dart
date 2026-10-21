import 'package:flutter/material.dart';
import 'clay_3d_button.dart';

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
    final primary = Theme.of(context).primaryColor;
    return Clay3DButton(
      text: text,
      onPressed: onPressed,
      isExpanded: true,
      color: isSecondary ? Colors.white : primary,
      shadowColor: isSecondary
          ? const Color(0xFFCBD5E1)
          : (Theme.of(context).colorScheme.primary.withValues(alpha: 0.8)),
      textColor: isSecondary ? primary : Colors.white,
      depth: 5.0,
      fontSize: 16.0,
    );
  }
}
