import 'package:flutter/material.dart';
import '../models/reading_buddy.dart';
import '../services/buddy_service.dart';
import '../widgets/clay_3d_button.dart';
import '../widgets/tilt_3d_card.dart';

class BuddySelectionScreen extends StatefulWidget {
  const BuddySelectionScreen({super.key});

  @override
  State<BuddySelectionScreen> createState() => _BuddySelectionScreenState();
}

class _BuddySelectionScreenState extends State<BuddySelectionScreen> {
  late final PageController _pageController;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    final activeId = BuddyService().currentBuddy.id;
    final initialIdx = ReadingBuddy.allBuddies.indexWhere((b) => b.id == activeId);
    _currentIndex = initialIdx != -1 ? initialIdx : 0;
    _pageController = PageController(
      initialPage: _currentIndex,
      viewportFraction: 0.82,
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onSelectBuddy(ReadingBuddy buddy) {
    BuddyService().selectBuddy(buddy);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Text(buddy.emoji, style: const TextStyle(fontSize: 22)),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                '${buddy.name} is now your active Reading Buddy!',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        backgroundColor: buddy.themePrimary,
        duration: const Duration(milliseconds: 1800),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
    Navigator.pop(context, buddy);
  }

  @override
  Widget build(BuildContext context) {
    final activeBuddy = ReadingBuddy.allBuddies[_currentIndex];

    return Scaffold(
      body: AnimatedContainer(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              activeBuddy.themeSurface,
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.08),
                              blurRadius: 8,
                            )
                          ],
                        ),
                        child: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                      ),
                      onPressed: () => Navigator.pop(context),
                    ),
                    Column(
                      children: [
                        Text(
                          'READING BUDDIES',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2.0,
                            color: activeBuddy.themePrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Choose Your Hero',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 48), // Balancing spacer
                  ],
                ),
              ),

              const SizedBox(height: 8),
              Text(
                'Swipe to explore superpowers and character guides!',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey.shade600,
                ),
              ),

              // 3D Buddy Carousel
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: (index) {
                    setState(() {
                      _currentIndex = index;
                    });
                  },
                  itemCount: ReadingBuddy.allBuddies.length,
                  itemBuilder: (context, index) {
                    final buddy = ReadingBuddy.allBuddies[index];
                    final isSelected = index == _currentIndex;

                    return AnimatedScale(
                      scale: isSelected ? 1.0 : 0.88,
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeOutCubic,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16.0),
                        child: Tilt3DCard(
                          onTap: () => _onSelectBuddy(buddy),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(32),
                              border: Border.all(
                                color: isSelected
                                    ? buddy.themePrimary
                                    : Colors.grey.shade200,
                                width: isSelected ? 3.5 : 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: buddy.themeShadow.withValues(alpha: isSelected ? 0.30 : 0.10),
                                  offset: const Offset(0, 16),
                                  blurRadius: isSelected ? 24 : 10,
                                ),
                              ],
                            ),
                            child: SingleChildScrollView(
                              padding: const EdgeInsets.all(24.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  // Top Badge
                                  Align(
                                    alignment: Alignment.topRight,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: buddy.themePrimary.withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      child: Text(
                                        buddy.badge,
                                        style: TextStyle(
                                          color: buddy.themePrimary,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                  ),

                                  // Big 3D Avatar Halo
                                  Container(
                                    width: 120,
                                    height: 120,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      gradient: RadialGradient(
                                        colors: [
                                          buddy.themeSecondary.withValues(alpha: 0.4),
                                          buddy.themeSurface,
                                        ],
                                      ),
                                      border: Border.all(
                                        color: buddy.themePrimary,
                                        width: 4,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: buddy.themeShadow.withValues(alpha: 0.25),
                                          offset: const Offset(0, 8),
                                          blurRadius: 16,
                                        )
                                      ],
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      buddy.emoji,
                                      style: const TextStyle(fontSize: 60),
                                    ),
                                  ),

                                  const SizedBox(height: 16),

                                  // Character Title
                                  Text(
                                    buddy.name,
                                    style: TextStyle(
                                      fontSize: 26,
                                      fontWeight: FontWeight.w900,
                                      color: buddy.textColor,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    buddy.series,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: buddy.themePrimary,
                                    ),
                                  ),

                                  const SizedBox(height: 16),

                                  // Superpower Box
                                  Container(
                                    padding: const EdgeInsets.all(14),
                                    decoration: BoxDecoration(
                                      color: buddy.themeSurface,
                                      borderRadius: BorderRadius.circular(18),
                                      border: Border.all(
                                        color: buddy.themePrimary.withValues(alpha: 0.2),
                                      ),
                                    ),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Icon(Icons.flash_on_rounded, size: 20, color: Colors.amber),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            buddy.superpower,
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: buddy.textColor,
                                              height: 1.35,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),

                                  const SizedBox(height: 14),

                                  // Speech Quote Bubble
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.05),
                                          blurRadius: 6,
                                        )
                                      ],
                                    ),
                                    child: Text(
                                      '"${buddy.cheerQuote}"',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontStyle: FontStyle.italic,
                                        fontWeight: FontWeight.w500,
                                        color: Colors.grey.shade700,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Page Indicator Dots
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  ReadingBuddy.allBuddies.length,
                  (index) {
                    final isCurrent = index == _currentIndex;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      height: 8,
                      width: isCurrent ? 24 : 8,
                      decoration: BoxDecoration(
                        color: isCurrent
                            ? activeBuddy.themePrimary
                            : Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(12),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 20),

              // 3D Primary Action Button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
                child: Clay3DButton(
                  text: 'TEAM UP WITH ${activeBuddy.name.toUpperCase()}! 🚀',
                  icon: Icons.auto_awesome,
                  color: activeBuddy.themePrimary,
                  shadowColor: activeBuddy.themeShadow,
                  isExpanded: true,
                  fontSize: 17,
                  onPressed: () => _onSelectBuddy(activeBuddy),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }
}
