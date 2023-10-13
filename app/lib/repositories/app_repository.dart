import 'dart:async';

import 'package:flutter/foundation.dart';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/models/deck.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/api_exception.dart';

enum FDAppStatus {
  uninitialized,
  authenticated,
  unauthenticated,
}

/// [AppRepository] is the repository for our app. The repository is responsible
/// for managing the state of our app, this includes the authentication status
/// of the current user and if a user is authenticated all his decks, the active
/// deck including all columns and sources for this deck.
///
/// This means that the [_columns] field must always contain the columns for the
/// [_activeDeckId].
class AppRepository with ChangeNotifier {
  FDAppStatus _status = FDAppStatus.uninitialized;
  String? _activeDeckId;
  List<FDDeck> _decks = [];
  List<FDColumn> _columns = [];

  FDAppStatus get status => _status;
  String? get activeDeckId => _activeDeckId;
  List<FDDeck> get decks => _decks;
  List<FDColumn> get columns => _columns;

  /// The [init] function is called to initialize the repository. Before this
  /// function is called, the [status] is [FDAppStatus.uninitialized]. Once the
  /// function is called, the [status] is set to [FDAppStatus.authenticated] if
  /// the user is authenticated or to [FDAppStatus.unauthenticated] if the user
  /// is not authenticated.
  ///
  /// To check if the user is authenticated, we check if the current session is
  /// not null. If this is the case we check if the user has a active deck and
  /// we are loading all the users decks. If the user has a active deck and the
  /// deck is in the list of decks we set the active deck to the active deck
  /// saved in the storage. If the user has no active deck or the active deck is
  /// not in the list of decks we set the active deck to the first deck in the
  /// list of decks.
  Future<void> init() async {
    try {
      final session = Supabase.instance.client.auth.currentSession;
      if (session != null) {
        final SharedPreferences prefs = await SharedPreferences.getInstance();
        final String? activeDeckId = prefs.getString('activeDeckId');

        _decks = await getDecks();

        if (activeDeckId != null &&
            _decks.where((deck) => deck.id == activeDeckId).isNotEmpty) {
          _activeDeckId = activeDeckId;
          await selectDeck(activeDeckId);
        } else if (_decks.isNotEmpty) {
          await selectDeck(_decks.first.id);
        }

        _status = FDAppStatus.authenticated;
        notifyListeners();
      } else {
        _status = FDAppStatus.unauthenticated;
        notifyListeners();
      }
    } catch (_) {
      _status = FDAppStatus.unauthenticated;
      notifyListeners();
    }
  }

  /// [signInWithPassword] is called to sign in a user. The function takes an
  /// [email] and a [password] as parameters. The function calls the Supabase
  /// client to sign in the user with the given email and password.
  ///
  /// If the user was signed in successfully, we run the same logic as in the
  /// [init] function, to set the active deck for the user.
  Future<void> signInWithPassword(
    String email,
    String password,
  ) async {
    await Supabase.instance.client.auth.signInWithPassword(
      email: email,
      password: password,
    );

    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? activeDeckId = prefs.getString('activeDeckId');

    _decks = await getDecks();

    if (activeDeckId != null &&
        _decks.where((deck) => deck.id == activeDeckId).isNotEmpty) {
      _activeDeckId = activeDeckId;
      await selectDeck(activeDeckId);
    } else if (_decks.isNotEmpty) {
      await selectDeck(_decks.first.id);
    }

    _status = FDAppStatus.authenticated;
    notifyListeners();
  }

  /// [signInWithCallback] is called to sign in a user. The function takes an
  /// [uri] which should contain the session information as a parameter. The
  /// function calls the Supabase client to sign in the user with the given
  /// session information.
  ///
  /// If the user was signed in successfully, we run the same logic as in the
  /// [init] function, to set the active deck for the user.
  Future<void> signInWithCallback(
    Uri uri,
  ) async {
    await Supabase.instance.client.auth.getSessionFromUrl(
      uri,
      storeSession: true,
    );

    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? activeDeckId = prefs.getString('activeDeckId');

    _decks = await getDecks();

    if (activeDeckId != null &&
        _decks.where((deck) => deck.id == activeDeckId).isNotEmpty) {
      _activeDeckId = activeDeckId;
      await selectDeck(activeDeckId);
    } else if (_decks.isNotEmpty) {
      await selectDeck(_decks.first.id);
    }

    _status = FDAppStatus.authenticated;
    notifyListeners();
  }

  /// [createDeck] is called to create a new deck for the user. The function
  /// takes a [name] as parameter. The function calls the Supabase client to
  /// create a new deck for the user with the given name. After the deck was
  /// created, the deck is set as the users active deck and the deck is added to
  /// the list of decks.
  Future<void> createDeck(
    String name,
  ) async {
    final data = await Supabase.instance.client
        .from('decks')
        .insert({
          'name': name,
          'userId': Supabase.instance.client.auth.currentUser!.id,
        })
        .select()
        .single();

    final newDeck = FDDeck.fromJson(data);

    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('activeDeckId', newDeck.id);

    _decks.add(newDeck);
    _activeDeckId = newDeck.id;
    notifyListeners();
  }

  /// [getDecks] is called to get all decks for the user. The function calls the
  /// Supabase client to get all decks for the user. The function returns a
  /// list of [FDDeck]s.
  Future<List<FDDeck>> getDecks() async {
    final data = await Supabase.instance.client
        .from('decks')
        .select('id, name')
        .order('name', ascending: true);
    return List<FDDeck>.from(data.map((deck) => FDDeck.fromJson(deck)));
  }

  /// [updateDeck] is called to update a deck for the user. The function takes
  /// a [deckId] and a [name] as parameters. The function calls the Supabase
  /// client to update the name of the deck. After the deck was updated, the
  /// deck is also updated in the list of decks.
  Future<void> updateDeck(
    String deckId,
    String name,
  ) async {
    await Supabase.instance.client
        .from('decks')
        .update({'name': name}).eq('id', deckId);

    for (var i = 0; i < _decks.length; i++) {
      if (_decks[i].id == deckId) {
        _decks[i].name = name;
        break;
      }
    }

    notifyListeners();
  }

  /// [deleteDeck] is called to delete a deck for the user. The function takes
  /// a [deckId] as parameter. The function calls the Supabase client to delete
  /// the deck. After the deck was deleted, the deck is also removed from the
  /// list of decks. If the deleted deck was the active deck, the active deck is
  /// set to `null`.
  Future<void> deleteDeck(
    String deckId,
  ) async {
    await Supabase.instance.client.from('decks').delete().eq('id', deckId);

    _decks.removeWhere((deck) => deck.id == deckId);
    if (deckId == _activeDeckId) {
      _activeDeckId = null;
    }

    notifyListeners();
  }

  /// [selectDeck] is called to set the provided [deckId] as the active deck for
  /// the user. The function calls the [getColumns] and [getSources] functions
  /// to get the columns for the deck and all sources for each column. After the
  /// columns and sources are fetched, the active deck is set to the provided
  /// deckId and the columns and sources are stored in the repository.
  Future<void> selectDeck(
    String deckId,
  ) async {
    final columns = await getColumns(deckId);
    for (final column in columns) {
      column.sources = await getSources(column.id);
    }

    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('activeDeckId', deckId);

    _columns = columns;
    _activeDeckId = deckId;
    notifyListeners();
  }

  /// [createColumn] is called to create a new column for the active deck. The
  /// function takes a [name] as parameter. The function calls the Supabase
  /// client to create a new column for the active deck with the given name.
  /// Finally the newly created column is added to the list of columns.
  Future<void> createColumn(
    String name,
  ) async {
    final data = await Supabase.instance.client.from('columns').insert({
      'deckId': _activeDeckId,
      'userId': Supabase.instance.client.auth.currentUser!.id,
      'name': name,
      'position': _columns.length,
    }).select();

    final newColumn =
        List<FDColumn>.from(data.map((column) => FDColumn.fromJson(column)));
    _columns.addAll(newColumn);
    notifyListeners();
  }

  /// [getColumns] is called to get all columns for the deck with the provided
  /// [deckId]. The function calls the Supabase client to get all columns for
  /// the deck. The function returns a list of [FDColumn]s.
  Future<List<FDColumn>> getColumns(
    String deckId,
  ) async {
    final data = await Supabase.instance.client
        .from('columns')
        .select('id, name, position')
        .eq('deckId', deckId)
        .order('position', ascending: true);
    return List<FDColumn>.from(data.map((column) => FDColumn.fromJson(column)));
  }

  /// [deleteColumn] is called to delete a column with the provided [columnId].
  /// The function calls the Supabase client to delete the column. After the
  /// column was deleted, the column is also removed from the list of columns.
  Future<void> deleteColumn(
    String columnId,
  ) async {
    await Supabase.instance.client.from('columns').delete().eq('id', columnId);

    _columns.removeWhere((column) => column.id == columnId);
    notifyListeners();
  }

  /// [updateColumn] is called to update a column with the provided [columnId].
  /// The function takes a [name] as parameter. The function calls the Supabase
  /// client to update the name of the column. After the column was updated, the
  /// column is also updated in the list of columns.
  Future<void> updateColumn(
    String columnId,
    String name,
  ) async {
    await Supabase.instance.client
        .from('columns')
        .update({'name': name}).eq('id', columnId);

    for (var i = 0; i < _columns.length; i++) {
      if (_columns[i].id == columnId) {
        _columns[i].name = name;
        break;
      }
    }

    notifyListeners();
  }

  /// [updateColumnPositions] is called to update the positions of two columns
  /// with the provided [index1] and [index2]. The function calls the Supabase
  /// client to update the positions of the columns. After the columns were
  /// updated, the columns are also updated in the list of columns.
  Future<void> updateColumnPositions(
    int index1,
    int index2,
  ) async {
    await Supabase.instance.client
        .from('columns')
        .update({'position': _columns[index2].position}).eq(
      'id',
      _columns[index1].id,
    );
    await Supabase.instance.client
        .from('columns')
        .update({'position': _columns[index1].position}).eq(
      'id',
      _columns[index2].id,
    );

    final tmp = _columns[index1];
    _columns[index1] = _columns[index2];
    _columns[index2] = tmp;
    _columns[index1].position = index1;
    _columns[index2].position = index2;

    notifyListeners();
  }

  /// [getSources] is called to get all sources for the column with the provided
  /// [columnId]. The function calls the Supabase client to get all sources for
  /// the column. The function returns a list of [FDSource]s.
  Future<List<FDSource>> getSources(
    String columnId,
  ) async {
    final data = await Supabase.instance.client
        .from('sources')
        .select('id, type, title, options, link, icon')
        .eq('columnId', columnId)
        .order('createdAt', ascending: true);
    return List<FDSource>.from(data.map((source) => FDSource.fromJson(source)));
  }

  /// [deleteSource] is called to delete a source with the provided [sourceId].
  /// The function calls the Supabase client to delete the source. After the
  /// source was deleted, the source is also removed from the list of sources of
  /// the column with the provided [columnId].
  Future<void> deleteSource(
    String columnId,
    String sourceId,
  ) async {
    await Supabase.instance.client.from('sources').delete().eq('id', sourceId);

    /// It could take some time before we can retrieve the items after a source
    /// was deleted, so that we delay the repository update by 3 seconds.
    await Future.delayed(const Duration(seconds: 3));

    for (var i = 0; i < _columns.length; i++) {
      if (_columns[i].id == columnId) {
        _columns[i].sources.removeWhere((source) => source.id == sourceId);
        break;
      }
    }

    notifyListeners();
  }

  /// [addSource] is called to add a source to the column with the provided
  /// [columnId]. The function takes a [source] as parameter. The function calls
  /// the `add-source-v1` edge function via the Supabase client to create the
  /// source. When the source was created the newly returned source is added to
  /// the list of sources of the column with the provided [columnId].
  Future<void> addSource(
    String columnId,
    FDSourceType type,
    FDSourceOptions options,
  ) async {
    final result = await Supabase.instance.client.functions.invoke(
      'add-source-v1',
      body: {
        'columnId': columnId,
        'type': type.toShortString(),
        'options': options.toJson(),
      },
    );

    if (result.status != 200) {
      throw ApiException(result.data['error'], result.status);
    }

    /// It could take some time before we can retrieve the items for a newly
    /// added source, so that we delay the repository update by 3 seconds.
    await Future.delayed(const Duration(seconds: 3));

    for (var i = 0; i < _columns.length; i++) {
      if (_columns[i].id == columnId) {
        _columns[i].sources.add(FDSource.fromJson(result.data));
        break;
      }
    }

    notifyListeners();
  }
}
