import 'package:flutter/material.dart';
import '../models/child_profile.dart';
import '../services/buddy_service.dart';
import '../widgets/buddy_mascot_bubble.dart';
import '../widgets/tilt_3d_card.dart';

class AssessmentSelectionScreen extends StatefulWidget {
  const AssessmentSelectionScreen({super.key});

  @override
  State<AssessmentSelectionScreen> createState() => _AssessmentSelectionScreenState();
}

class _AssessmentSelectionScreenState extends State<AssessmentSelectionScreen> {
  @override
  Widget build(BuildContext context) {
    final ChildProfile child = ModalRoute.of(context)!.settings.arguments as ChildProfile;
    final activeBuddy = BuddyService().currentBuddy;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('${child.name}’s Reading Quest 🌟'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: ActionChip(
              avatar: Text(activeBuddy.emoji, style: const TextStyle(fontSize: 16)),
              label: Text(
                activeBuddy.name,
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                  color: activeBuddy.textColor,
                ),
              ),
              backgroundColor: activeBuddy.themeSurface,
              side: BorderSide(color: activeBuddy.themePrimary, width: 1.5),
              onPressed: () async {
                await Navigator.pushNamed(context, '/buddy_select');
                setState(() {});
              },
            ),
          )
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Floating 3D Mascot Companion Greeting
              BuddyMascotBubble(
                onBuddyTap: () async {
                  await Navigator.pushNamed(context, '/buddy_select');
                  setState(() {});
                },
              ),
              const SizedBox(height: 20),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Choose Your Adventure',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () async {
                      await Navigator.pushNamed(context, '/buddy_select');
                      setState(() {});
                    },
                    icon: const Icon(Icons.swap_horiz_rounded, size: 18),
                    label: const Text('Change Hero', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Activity 1: Guided Reading (with Buddy theme!)
              _build3DActivityCard(
                context,
                child: child,
                title: 'Oral Reading Quest 📖',
                subtitle: 'Camera & mic track your voice and reading jumps',
                badgeText: 'Earn 100 EXP',
                icon: Icons.auto_stories_rounded,
                primaryColor: const Color(0xFF0284C7), // Celestial Azure
                shadowColor: const Color(0xFF0369A1),
                surfaceColor: const Color(0xFFE0F2FE),
                route: '/reading_assessment',
              ),
              const SizedBox(height: 14),

              // Activity 2: Cognitive Games (Ninja / Alien drills)
              _build3DActivityCard(
                context,
                child: child,
                title: 'Ninja & Alien Brain Games 🧠',
                subtitle: 'Slice b vs d, match rhyming sounds & beat the clock',
                badgeText: '4 Mini-Games',
                icon: Icons.sports_esports_rounded,
                primaryColor: const Color(0xFFE11D48), // Rose Crimson
                shadowColor: const Color(0xFF9F1239),
                surfaceColor: const Color(0xFFFFE4E6),
                route: '/cognitive_game',
              ),
              const SizedBox(height: 14),

              // Activity 3: Personalized Practice
              _build3DActivityCard(
                context,
                child: child,
                title: 'Personalized Daily Coach 🚀',
                subtitle: 'Bimodal line tracking and phonics word flashcards',
                badgeText: 'Daily 15 Min',
                icon: Icons.military_tech_rounded,
                primaryColor: const Color(0xFF059669), // Emerald
                shadowColor: const Color(0xFF064E3B),
                surfaceColor: const Color(0xFFD1FAE5),
                route: '/learning_activity',
              ),
              const SizedBox(height: 14),

              // Activity 4: Progress & Reports
              _build3DActivityCard(
                context,
                child: child,
                title: 'Treasure Map & Reports 🏆',
                subtitle: 'Track reading speed WPM growth & download PDF',
                badgeText: 'History',
                icon: Icons.insights_rounded,
                primaryColor: const Color(0xFFD97706), // Amber
                shadowColor: const Color(0xFF92400E),
                surfaceColor: const Color(0xFFFEF3C7),
                route: '/progress',
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _build3DActivityCard(
    BuildContext context, {
    required ChildProfile child,
    required String title,
    required String subtitle,
    required String badgeText,
    required IconData icon,
    required Color primaryColor,
    required Color shadowColor,
    required Color surfaceColor,
    required String route,
  }) {
    return Tilt3DCard(
      onTap: () {
        Navigator.pushNamed(context, route, arguments: child);
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: primaryColor.withValues(alpha: 0.3), width: 2),
          boxShadow: [
            BoxShadow(
              color: shadowColor,
              offset: const Offset(0, 5),
              blurRadius: 0, // 3D tactile edge
            ),
            BoxShadow(
              color: shadowColor.withValues(alpha: 0.15),
              offset: const Offset(0, 10),
              blurRadius: 14,
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 16.0),
          child: Row(
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: surfaceColor,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: primaryColor.withValues(alpha: 0.4), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: shadowColor.withValues(alpha: 0.2),
                      offset: const Offset(0, 3),
                      blurRadius: 6,
                    )
                  ],
                ),
                child: Icon(icon, color: primaryColor, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            title,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: surfaceColor,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            badgeText,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: primaryColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey.shade600,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(Icons.arrow_forward_ios_rounded, color: primaryColor, size: 16),
            ],
          ),
        ),
      ),
    );
  }
}
