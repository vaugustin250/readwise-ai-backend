import 'package:flutter/material.dart';

class ParentalConsentDialog extends StatefulWidget {
  final VoidCallback onConsentGranted;

  const ParentalConsentDialog({
    super.key,
    required this.onConsentGranted,
  });

  @override
  State<ParentalConsentDialog> createState() => _ParentalConsentDialogState();
}

class _ParentalConsentDialogState extends State<ParentalConsentDialog> {
  bool _consentChecked = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Row(
        children: [
          Icon(Icons.shield_outlined, color: Theme.of(context).primaryColor, size: 28),
          const SizedBox(width: 10),
          const Expanded(
            child: Text(
              'Guardian Consent & Privacy',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Before starting the reading assessment, please review how child data is handled:',
              style: TextStyle(fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 12),
            _buildPrivacyBullet(
              Icons.mic_none_rounded,
              'Ephemeral Audio Processing',
              'Microphone data is processed locally in temporary memory to extract speech hesitation pauses and is deleted immediately.',
            ),
            const SizedBox(height: 10),
            _buildPrivacyBullet(
              Icons.remove_red_eye_outlined,
              'Gaze Biomechanics Only',
              'Front-camera frames are used exclusively to calculate eye fixations and regressions. No child facial imagery is permanently saved.',
            ),
            const SizedBox(height: 10),
            _buildPrivacyBullet(
              Icons.medical_information_outlined,
              'Pre-Diagnostic Screening',
              'ReadWise AI provides an educational screening estimate, not a formal clinical diagnosis.',
            ),
            const SizedBox(height: 16),
            Container(
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: CheckboxListTile(
                value: _consentChecked,
                activeColor: Theme.of(context).primaryColor,
                contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                title: const Text(
                  'I am the parent/guardian and grant permission to proceed with this screening session.',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
                onChanged: (val) {
                  setState(() {
                    _consentChecked = val ?? false;
                  });
                },
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: _consentChecked ? Theme.of(context).primaryColor : Colors.grey,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          onPressed: _consentChecked
              ? () {
                  Navigator.pop(context);
                  widget.onConsentGranted();
                }
              : null,
          child: const Text('Accept & Begin Session', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }

  Widget _buildPrivacyBullet(IconData icon, String title, String desc) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: const Color(0xFF6C63FF)),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 2),
              Text(desc, style: TextStyle(color: Colors.grey.shade700, fontSize: 12, height: 1.3)),
            ],
          ),
        ),
      ],
    );
  }
}
