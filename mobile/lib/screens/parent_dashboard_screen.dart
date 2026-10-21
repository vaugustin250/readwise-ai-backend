import 'package:flutter/material.dart';
import '../models/child_profile.dart';
import '../widgets/custom_button.dart';
import '../repositories/profile_repository.dart';

class ParentDashboardScreen extends StatefulWidget {
  const ParentDashboardScreen({super.key});

  @override
  State<ParentDashboardScreen> createState() => _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends State<ParentDashboardScreen> {
  late Future<List<ChildProfile>> _childrenFuture;

  @override
  void initState() {
    super.initState();
    _loadChildren();
  }

  void _loadChildren() {
    setState(() {
      _childrenFuture = ProfileRepository().getChildren();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.show_chart),
            onPressed: () {
              Navigator.pushNamed(context, '/progress');
            },
            tooltip: 'Progress Dashboard',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              Navigator.pushReplacementNamed(context, '/login');
            },
          )
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Child Profiles', style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 24)),
              const SizedBox(height: 16),
              Expanded(
                child: FutureBuilder<List<ChildProfile>>(
                  future: _childrenFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    if (!snapshot.hasData || snapshot.data!.isEmpty) {
                      return const Center(child: Text('No profiles found. Add one!'));
                    }
                    final children = snapshot.data!;
                    return ListView.builder(
                      itemCount: children.length,
                      itemBuilder: (context, index) {
                        final child = children[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(16),
                            leading: CircleAvatar(
                              backgroundColor: Theme.of(context).primaryColor.withValues(alpha: 0.2),
                              radius: 30,
                              child: Icon(Icons.person, color: Theme.of(context).primaryColor, size: 30),
                            ),
                            title: Text(child.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                            subtitle: Text('Age: ${child.age} | ${child.grade}'),
                            trailing: const Icon(Icons.arrow_forward_ios),
                            onTap: () {
                              Navigator.pushNamed(context, '/assessment_selection', arguments: child);
                            },
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
              CustomButton(
                text: '+ Add Child',
                onPressed: () {
                  Navigator.pushNamed(context, '/add_child').then((_) {
                    _loadChildren(); // Refresh the list
                  });
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
