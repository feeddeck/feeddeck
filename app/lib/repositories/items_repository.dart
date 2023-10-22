import 'dart:async';

import 'package:flutter/material.dart';

import 'package:collection/collection.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';

/// [ItemsFilters] is a class which contains all filters for the items in a
/// [ItemsRepository]. These filter can be used by a user to filter the items
/// which should be loaded by a [ItemsRepository] and displayed in a column.
class ItemsFilters {
  ItemStateFilter stateFilter;
  String sourceIdFilter;
  String searchTermFilter;
  int createdAtFilter;
  int offsetFilter;

  ItemsFilters({
    required this.stateFilter,
    required this.sourceIdFilter,
    required this.searchTermFilter,
    required this.createdAtFilter,
    required this.offsetFilter,
  });
}

/// [ItemStateFilter] is a enum value which defines the state filter for items.
/// The filter can be [read], [unread] or [bookmarked]. The [none] filter is
/// used to return all items regardless if they are read, unread or bookmarked.
enum ItemStateFilter {
  none,
  read,
  unread,
  bookmarked,
}

/// The [ToString] extension defines a [toShortString] function, which returns a
/// `String` which can be safely passed within a database query for the specifed
/// [ItemStateFilter].
extension ToString on ItemStateFilter {
  String toShortString() {
    return toString().split('.').last;
  }
}

/// [ItemsStatus] is a enum value which represents the status of the items in a
/// column. A column can have the following [ItemsStatus]
///   - [loaded] when the items where loaded
///   - [loading] during the time when the items are retrieved from our database
///   - [loadedLast] when there are no more items which can be loaded from the
///     database.
enum ItemsStatus {
  loaded,
  loading,
  loadedLast,
}

/// [now] returns the current Unix timestamp in seconds.
int now() {
  return (DateTime.now().millisecondsSinceEpoch ~/ 1000);
}

/// [ItemsRepository] is used to manage the items in a column. Therefor we need
/// the [column] to which the items belong to. When the repository is
/// initialized we have to call the [_init] function to load the items for the
/// provided column.
class ItemsRepository with ChangeNotifier {
  ItemsRepository({
    required this.column,
  }) {
    _init();
  }

  final FDColumn column;
  ItemsStatus _status = ItemsStatus.loaded;
  List<FDItem> _items = [];
  ItemsFilters _filters = ItemsFilters(
    stateFilter: ItemStateFilter.unread,
    sourceIdFilter: '',
    searchTermFilter: '',
    createdAtFilter: now(),
    offsetFilter: 0,
  );

  ItemsStatus? get status => _status;
  List<FDItem> get items => _items;

  ItemStateFilter? get stateFilter => _filters.stateFilter;
  String? get sourceIdFilter => _filters.sourceIdFilter;
  String get searchTermFilter => _filters.searchTermFilter;

  /// [getSource] return the source of the current column for the given id. If
  /// no source with this [sourceId] could be found it returns `null`.
  FDSource? getSource(String sourceId) =>
      column.sources.firstWhereOrNull((source) => source.id == sourceId);

  /// [_init] is called when a new [ItemsRepository] is initialized. Before we
  /// get all items for the repository from the database, we check if we had
  /// already stored the state for the repository to avoid unnecessary database
  /// calls.
  Future<void> _init() async {
    final state = ItemsRepositoryStore().get(column.identifier());
    if (state != null) {
      _status = state.status;
      _filters = state.filters;
      _items.addAll(state.items);
      notifyListeners();
    } else {
      await _getItems();
    }
  }

  /// [_getItems] is used to retrieve a list of items from our database, by
  /// using the provided column and filters.
  ///
  /// The modification of the filters should be happen via other functions of
  /// the [ItemsRepository]. After the filters where modified the [_getItems]
  /// function should be called.
  Future<void> _getItems() async {
    try {
      _status = ItemsStatus.loading;
      notifyListeners();

      /// We only select the `id`, `sourceId`, `title`, `link`, `media`,
      /// `description`, `author`, `publishedAt`, `isRead` and `isBookmarked`
      /// fields from the database. This is done to reduce the amount of data
      /// which is transferred from the database to the app. Besides that we
      /// also filter the items by the `id` of the provided [column].
      var filter = Supabase.instance.client
          .from('items')
          .select(
            'id, sourceId, title, link, media, description, author, options, publishedAt, isRead, isBookmarked',
          )
          .eq('columnId', column.id);

      /// If the user selected a source, we filter the items by the id of the
      /// selected source which is stored in the [_filters.sourceIdFilter]
      /// field.
      if (_filters.sourceIdFilter != '') {
        filter = filter.eq('sourceId', sourceIdFilter);
      }

      filter = filter.lte('createdAt', _filters.createdAtFilter);

      /// Based on the [_filters.stateFilter] we filter the items by the value
      /// of the `isRead` or `isBookmarked` field.
      if (_filters.stateFilter == ItemStateFilter.unread) {
        filter = filter.eq('isRead', false);
      } else if (_filters.stateFilter == ItemStateFilter.read) {
        filter = filter.eq('isRead', true);
      } else if (_filters.stateFilter == ItemStateFilter.bookmarked) {
        filter = filter.eq('isBookmarked', true);
      }

      /// If the user entered a search term, we filter the items by the entered
      /// search term. The search term is stored in the
      /// [_filters.searchTermFilter] filter.
      if (_filters.searchTermFilter != '') {
        filter = filter.textSearch('tsv', searchTermFilter);
      }

      /// Finally we can get the items ordered by the `publishedAt` field and
      /// limited to 50 items. The offset is defined by the [_filters.offset]
      /// filter to page through all the items.
      final data = await filter
          .order('publishedAt')
          .range(_filters.offsetFilter, _filters.offsetFilter + 50);

      /// The returned items are added to the [_items] field and the status is
      /// set to [ItemsStatus.loaded] or [ItemsStatus.loadedLast] based on the
      /// amount of items which where returned from the database. If the amount
      /// of items is less than 50 we know that we have reached the end of the
      /// list.
      final items = List<FDItem>.from(
        data.map((item) => FDItem.fromJson(item)),
      );

      _items.addAll(items);
      if (items.length < 50) {
        _status = ItemsStatus.loadedLast;
      } else {
        _status = ItemsStatus.loaded;
      }

      /// Finally we store the state of the repository, so that we do not have
      /// to retrieve the items from the database again when therepository is
      /// reinitialized.
      ItemsRepositoryStore().set(
        column.identifier(),
        _status,
        _filters,
        _items,
      );
      notifyListeners();
    } catch (_) {
      _status = ItemsStatus.loaded;
      notifyListeners();
    }
  }

  /// [filterBySource] filters the list of items by a source. The source is
  /// identified by the given [sourceId]. When the function is called we will
  /// set the [_filters.sourceIdFilter] to the provided id, the
  /// [_filters.createdAtFilter] to the current time and we will reset the
  /// [_filters._offsetFilter] and [_items].
  ///
  /// We will leave all other fields untouched to allow a user to apply multiple
  /// filters.
  Future<void> filterBySource(String sourceId) async {
    _filters.sourceIdFilter = sourceId;
    _filters.createdAtFilter = now();
    _filters.offsetFilter = 0;
    _items = [];
    await _getItems();
  }

  /// [filterBySearchTerm] filters the list of items by a search term. When the
  /// function is called we will set the [_filters.searchTermFilter] to the
  /// provided search term, the [_filters.createdAtFilter] to the current time
  /// and we will reset the [_filters.offsetFilter] and [_items].
  ///
  /// We will leave all other fields untouched to allow a user to apply multiple
  /// filters.
  Future<void> filterBySearchTerm(String searchTerm) async {
    _filters.searchTermFilter = searchTerm;
    _filters.createdAtFilter = now();
    _filters.offsetFilter = 0;
    _items = [];
    await _getItems();
  }

  /// [filterByState] filters the list of items by the state of the items. When
  /// the function is called we will set the [_filters.stateFilter] to the
  /// provided state, the [_filters.createdAtFilter] to the current time and we
  /// will reset the [_filters.offsetFilter] and [_items].
  ///
  /// We will leave all other fields untouched to allow a user to apply multiple
  /// filters.
  Future<void> filterByState(ItemStateFilter state) async {
    _filters.stateFilter = state;
    _filters.createdAtFilter = now();
    _filters.offsetFilter = 0;
    _items = [];
    await _getItems();
  }

  /// [loadMore] is used to load the next bunch of items for the current column.
  /// This is done be setting a new [_filters.offsetFilter] which is the former
  /// offset plus the number of items we want to get (50).
  Future<void> loadMore() async {
    _filters.offsetFilter = _filters.offsetFilter + 50;
    await _getItems();
  }

  /// [reload] resets all the users filters and reloads the list of items with
  /// the initial defined values.
  Future<void> reload() async {
    _filters.sourceIdFilter = '';
    _filters.stateFilter = ItemStateFilter.unread;
    _filters.searchTermFilter = '';
    _filters.createdAtFilter = now();
    _filters.offsetFilter = 0;
    _items = [];
    await _getItems();
  }

  /// [updateReadState] can be used to mark the item given by the [itemId] as
  /// read or unread. When [read] is `true` the item will be marked as read and
  /// if it is `false` it will be marked as unread.
  Future<void> updateReadState(String itemId, bool read) async {
    try {
      await Supabase.instance.client
          .from('items')
          .update({'isRead': read}).eq('id', itemId);
      for (var i = 0; i < _items.length; i++) {
        if (_items[i].id == itemId) {
          _items[i].isRead = read;
          break;
        }
      }

      ItemsRepositoryStore().set(column.id, _status, _filters, _items);
      notifyListeners();
    } catch (err) {
      rethrow;
    }
  }

  /// [updateReadStates] can be used to mark a list of items provided via their
  /// [itemIds] as read / unread. When the [read] value is `true` items are
  /// marked as read and when it is `false` as unread.
  ///
  /// We have to split the provided list of [itemIds] into chunks of 25 items,
  /// to avoid the request uri to long error from Supabase. We decided to use 25
  /// items per chunk, because we think that this is a good tradeoff between the
  /// number of requests and the number of items we can update at once.
  Future<void> updateReadStates(List<String> itemIds, bool read) async {
    try {
      final chunks = itemIds.slices(25).toList();

      for (var i = 0; i < chunks.length; i++) {
        await Supabase.instance.client
            .from('items')
            .update({'isRead': read}).in_('id', chunks[i]);
        for (var j = 0; j < _items.length; j++) {
          if (chunks[i].contains(_items[j].id)) {
            _items[j].isRead = read;
          }
        }
      }

      ItemsRepositoryStore().set(column.id, _status, _filters, _items);
      notifyListeners();
    } catch (err) {
      rethrow;
    }
  }

  /// [updateBookmarkedState] can be used to bookmark a item given by it's
  /// [itemId]. If the [bookmarked] value is `false` the users bookmark will be
  /// removed.
  Future<void> updateBookmarkedState(String itemId, bool bookmarked) async {
    try {
      await Supabase.instance.client
          .from('items')
          .update({'isBookmarked': bookmarked}).eq('id', itemId);
      for (var i = 0; i < _items.length; i++) {
        if (_items[i].id == itemId) {
          _items[i].isBookmarked = bookmarked;
          break;
        }
      }

      ItemsRepositoryStore().set(column.id, _status, _filters, _items);
      notifyListeners();
    } catch (err) {
      rethrow;
    }
  }
}

/// [ItemsRepositoryStoreState] represents the state of a single ItemsRepository
/// in the [ItemsRepositoryStore]. The state contains all the loaded [items] and
/// the [filters] set by user to load the items.
class ItemsRepositoryStoreState {
  ItemsStatus status;
  ItemsFilters filters;
  List<FDItem> items;

  ItemsRepositoryStoreState({
    required this.status,
    required this.filters,
    required this.items,
  });
}

/// [ItemsRepositoryStore] is our store for all [ItemsRepository] we create.
/// The [ItemsRepositoryStore] implements a singleton pattern so that it is only
/// initialized once in the app. This allows us to store all repositories in the
/// store with the column they belong to as id.
///
/// The main purpose of the store is to avoid unnecessary database calls when a
/// column is rerendered.
class ItemsRepositoryStore {
  static final ItemsRepositoryStore _instance =
      ItemsRepositoryStore._internal();

  final Map<String, ItemsRepositoryStoreState> itemsRepositoryStoreStates = {};

  factory ItemsRepositoryStore() {
    return _instance;
  }

  ItemsRepositoryStore._internal();

  /// [get] returns the stored [ItemsRepositoryStoreState] for the provided
  /// [columnId]. If the repository state wasn't stored already the function
  /// returns `null` to indicate that we have to get the items from the
  /// database.
  ItemsRepositoryStoreState? get(String columnId) {
    return itemsRepositoryStoreStates[columnId];
  }

  /// [set] saves the [items] and [filters] for a [columnId] in the store. This
  /// method should be called every time the list of items or a filter is
  /// changed.
  ///
  /// The best is to call the [set] function right before we call
  /// `notifyListeners` in the repository.
  set(
    String columnId,
    ItemsStatus status,
    ItemsFilters filters,
    List<FDItem> items,
  ) {
    return itemsRepositoryStoreStates[columnId] = ItemsRepositoryStoreState(
      status: status,
      filters: filters,
      items: items,
    );
  }
}
