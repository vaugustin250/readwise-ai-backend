import 'package:flutter/material.dart';

class Tilt3DCard extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final double maxTilt;
  final BorderRadius? borderRadius;

  const Tilt3DCard({
    super.key,
    required this.child,
    this.onTap,
    this.maxTilt = 0.15,
    this.borderRadius,
  });

  @override
  State<Tilt3DCard> createState() => _Tilt3DCardState();
}

class _Tilt3DCardState extends State<Tilt3DCard> {
  double _xAngle = 0.0;
  double _yAngle = 0.0;
  bool _isHovered = false;

  void _onPan(DragUpdateDetails details, Size size) {
    setState(() {
      _yAngle += (details.delta.dx / size.width) * 0.4;
      _xAngle -= (details.delta.dy / size.height) * 0.4;
      _xAngle = _xAngle.clamp(-widget.maxTilt, widget.maxTilt);
      _yAngle = _yAngle.clamp(-widget.maxTilt, widget.maxTilt);
    });
  }

  void _resetTilt() {
    setState(() {
      _xAngle = 0.0;
      _yAngle = 0.0;
      _isHovered = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final cardSize = Size(constraints.maxWidth, constraints.maxHeight);

        return GestureDetector(
          onPanDown: (_) => setState(() => _isHovered = true),
          onPanUpdate: (details) => _onPan(details, cardSize),
          onPanEnd: (_) => _resetTilt(),
          onPanCancel: () => _resetTilt(),
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 140),
            curve: Curves.easeOutCubic,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.0012) // Depth perspective
              ..rotateX(_xAngle)
              ..rotateY(_yAngle)
              ..scaleByDouble(_isHovered ? 1.02 : 1.0, _isHovered ? 1.02 : 1.0, _isHovered ? 1.02 : 1.0, 1.0),
            transformAlignment: Alignment.center,
            child: widget.child,
          ),
        );
      },
    );
  }
}
