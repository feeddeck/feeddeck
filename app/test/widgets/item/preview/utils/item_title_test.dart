import 'package:feeddeck/widgets/item/preview/utils/item_title.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Should render title', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: ItemTitle(itemTitle: 'My Title'),
      ),
    );
    expect(find.byType(Container), findsOneWidget);
    expect(find.byType(Text), findsOneWidget);
    expect(find.text('My Title'), findsOneWidget);
  });

  testWidgets('Should render empty container when empty string is provided',
      (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: ItemTitle(itemTitle: ''),
      ),
    );
    expect(find.byType(Container), findsOneWidget);
    expect(find.byType(Text), findsNothing);
  });
}
