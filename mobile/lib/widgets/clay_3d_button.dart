import 'package:flutter/material.dart';

class Clay3DButton extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final IconData? icon;
  final Color color;
  final Color shadowColor;
  final Color textColor;
  final double depth;
  final double fontSize;
  final EdgeInsetsGeometry padding;
  final bool isExpanded;

  const Clay3DButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.icon,
    this.color = const Color(0xFF0284C7),
    this.shadowColor = const Color(0xFF0369A1),
    this.textColor = Colors.white,
    this.depth = 6.0,
    this.fontSize = 17.0,
    this.padding = const EdgeInsets.symmetric(horizontal: 24, vertical: 15),
    this.isExpanded = false,
  });

  @override
  State<Clay3DButton> createState() => _Clay3DButtonState();
}

class _Clay3DButtonState extends State<Clay3DButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final double currentDepth = _isPressed ? 1.0 : widget.depth;
    final double topMargin = _isPressed ? (widget.depth - 1.0) : 0.0;
    final double bottomMargin = _isPressed ? 0.0 : (widget.depth - 1.0);

    Widget content = AnimatedContainer(
      duration: const Duration(milliseconds: 70),
      curve: Curves.easeOutQuad,
      margin: EdgeInsets.only(top: topMargin, bottom: bottomMargin),
      padding: widget.padding,
      decoration: BoxDecoration(
        color: widget.color,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.25),
          width: 1.5,
        ),
        boxShadow: [
          // Sharp 3D tactile extruded bottom edge
          BoxShadow(
            color: widget.shadowColor,
            offset: Offset(0, currentDepth),
            blurRadius: 0,
          ),
          // Soft ambient drop shadow underneath the extruded slab
          if (!_isPressed)
            BoxShadow(
              color: widget.shadowColor.withValues(alpha: 0.35),
              offset: Offset(0, widget.depth + 4),
              blurRadius: 10,
            ),
        ],
      ),
      child: Row(
        mainAxisSize: widget.isExpanded ? MainAxisSize.max : MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (widget.icon != null) ...[
            Icon(widget.icon, color: widget.textColor, size: widget.fontSize + 4),
            const SizedBox(width: 10),
          ],
          Flexible(
            child: Text(
              widget.text,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: widget.textColor,
                fontSize: widget.fontSize,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
    );

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onPressed();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: widget.isExpanded ? SizedBox(width: double.infinity, child: content) : content,
    );
  }
}
