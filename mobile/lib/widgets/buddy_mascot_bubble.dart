import 'package:flutter/material.dart';
import '../models/reading_buddy.dart';
import '../services/buddy_service.dart';

class BuddyMascotBubble extends StatefulWidget {
  final String? message;
  final String? customMessage;
  final ReadingBuddy? buddy;
  final VoidCallback? onBuddyTap;

  const BuddyMascotBubble({
    super.key,
    this.message,
    this.customMessage,
    this.buddy,
    this.onBuddyTap,
  });

  @override
  State<BuddyMascotBubble> createState() => _BuddyMascotBubbleState();
}

class _BuddyMascotBubbleState extends State<BuddyMascotBubble>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _floatAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 2200),
      vsync: this,
    )..repeat(reverse: true);

    _floatAnimation = Tween<double>(begin: -4.0, end: 4.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final activeBuddy = widget.buddy ?? BuddyService().currentBuddy;
    final message = widget.message ?? widget.customMessage ?? activeBuddy.cheerQuote;

    return AnimatedBuilder(
      animation: _floatAnimation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _floatAnimation.value),
          child: child,
        );
      },
      child: GestureDetector(
        onTap: widget.onBuddyTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: activeBuddy.themeSurface,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: activeBuddy.themePrimary.withValues(alpha: 0.35),
              width: 2.0,
            ),
            boxShadow: [
              BoxShadow(
                color: activeBuddy.themeShadow.withValues(alpha: 0.18),
                offset: const Offset(0, 6),
                blurRadius: 14,
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // 3D Avatar Orb
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  border: Border.all(color: activeBuddy.themeSecondary, width: 2.5),
                  boxShadow: [
                    BoxShadow(
                      color: activeBuddy.themeShadow.withValues(alpha: 0.25),
                      offset: const Offset(0, 3),
                      blurRadius: 6,
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: Text(
                  activeBuddy.emoji,
                  style: const TextStyle(fontSize: 26),
                ),
              ),
              const SizedBox(width: 14),
              // Buddy Speech Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Text(
                          activeBuddy.name,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            color: activeBuddy.themePrimary,
                            letterSpacing: 0.3,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: activeBuddy.themePrimary.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            activeBuddy.badge,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: activeBuddy.textColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      message,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: activeBuddy.textColor,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
