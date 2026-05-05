import type { RouterOutputs } from '@eushop/api-router';
import { COUNTRIES } from '@eushop/catalog';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { trpc } from '../lib/trpc';
import { pickString, useMobileMessages } from '../lib/i18n';

type CatalogSearchHit = RouterOutputs['catalog']['searchWithSuggestions'][number];
type BrowseItem = RouterOutputs['catalog']['browse']['items'][number];

function browseItemToSearchHit(item: BrowseItem): CatalogSearchHit {
  const images = [item.imageVariants?.large, item.imageVariants?.small, item.defaultImageUrl]
    .filter((u): u is string => !!u)
    .slice(0, 3);
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    originCountryIso2: item.originCountryIso2,
    description: item.description,
    imageVariants: item.imageVariants,
    images,
    source: 'local',
    barcode: item.barcode ?? null,
    openFoodFactsId: item.openFoodFactsId ?? null,
  };
}

function flagEmojiForIso2(iso2: string) {
  return COUNTRIES.find((x) => x.iso2 === iso2.toUpperCase())?.flagEmoji ?? '🌍';
}

function countryNameForIso2(iso2: string) {
  return COUNTRIES.find((x) => x.iso2 === iso2.toUpperCase())?.name ?? iso2.toUpperCase();
}

function fallbackImageForItem(name: string, originCountryIso2: string) {
  const flag = flagEmojiForIso2(originCountryIso2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="#f4efe7"/>
<stop offset="100%" stop-color="#e8dfd2"/>
</linearGradient>
</defs>
<rect width="800" height="800" fill="url(#bg)"/>
<circle cx="680" cy="120" r="140" fill="#c9770020"/>
<circle cx="120" cy="700" r="170" fill="#9a908120"/>
<text x="72" y="170" font-size="88" font-family="ui-serif, Georgia, serif">${flag}</text>
<foreignObject x="72" y="240" width="656" height="450">
<div xmlns="http://www.w3.org/1999/xhtml" style="font-family: ui-serif, Georgia, serif; color: #2e271f; font-size: 44px; line-height: 1.2; font-weight: 600;">
${name.replaceAll(/[<&>]/g, '')}
</div>
</foreignObject>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Mobile mirror of the web ProductPicker. Same contract: search the catalog,
 * pick a product + an image candidate, fall back to upload / paste / propose
 * when the catalog doesn't have the item yet.
 */

export interface ProductPickerSelection {
  foodItemId?: string;
  freeformName?: string;
  photos: { url: string }[];
  proposedNewItem?: boolean;
}

interface Props {
  value: ProductPickerSelection;
  onChange: (next: ProductPickerSelection) => void;
}

export function ProductPicker({ value, onChange }: Readonly<Props>) {
  const messages = useMobileMessages();
  const t = (path: string[], fallback: string) => pickString(messages, path, fallback);
  const { width: windowWidth } = useWindowDimensions();
  const [query, setQuery] = useState(value.freeformName ?? '');
  const [debouncedQ, setDebouncedQ] = useState(query);
  const [pasteUrl, setPasteUrl] = useState('');
  const [picsOpen, setPicsOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState('all');
  const [sortMode, setSortMode] = useState<'name-asc' | 'name-desc'>('name-asc');

  useEffect(() => {
    const h = setTimeout(() => setDebouncedQ(query), 300);
    return () => clearTimeout(h);
  }, [query]);

  const search = trpc.catalog.searchWithSuggestions.useQuery(
    { q: debouncedQ, limit: 6, includeRemote: true },
    { enabled: debouncedQ.length >= 2 },
  );
  const browseGallery = trpc.catalog.browse.useInfiniteQuery(
    { limit: 60 },
    {
      enabled: picsOpen,
      staleTime: 60_000,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const fetchRemote = trpc.media.fetchRemoteImage.useMutation();

  const onSelect = (hit: CatalogSearchHit, imageUrl?: string) => {
    const pickedImage =
      imageUrl ?? hit.images[0] ?? fallbackImageForItem(hit.name, hit.originCountryIso2);
    onChange({
      foodItemId: hit.source === 'local' ? hit.id : undefined,
      freeformName: hit.name,
      photos: pickedImage ? [{ url: pickedImage }] : value.photos,
    });
  };

  const onPaste = async () => {
    if (!pasteUrl) return;
    try {
      const result = await fetchRemote.mutateAsync({
        url: pasteUrl,
        purpose: 'food-item-proposal',
      });
      onChange({
        ...value,
        freeformName: value.freeformName?.trim().length ? value.freeformName : query.trim(),
        photos: [...value.photos, { url: result.publicUrl }],
      });
      setPasteUrl('');
    } catch (e) {
      Alert.alert(
        t(['productPicker', 'errorFetchImage'], 'Could not fetch the image'),
        e instanceof Error
          ? e.message
          : t(['productPicker', 'errorFetchImage'], 'Could not fetch the image'),
      );
    }
  };

  const browseItems = useMemo(
    () => browseGallery.data?.pages.flatMap((page) => page.items) ?? [],
    [browseGallery.data],
  );
  const availableCountryIso2 = useMemo(
    () =>
      Array.from(new Set(browseItems.map((item) => item.originCountryIso2))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [browseItems],
  );

  useEffect(() => {
    if (!picsOpen || !browseGallery.hasNextPage || browseGallery.isFetchingNextPage) return;
    void browseGallery.fetchNextPage();
  }, [
    picsOpen,
    browseGallery.hasNextPage,
    browseGallery.isFetchingNextPage,
    browseGallery.fetchNextPage,
  ]);

  const renderSearchHit = (hit: CatalogSearchHit) => (
    <TouchableOpacity
      key={hit.id}
      onPress={() => onSelect(hit)}
      className={`rounded-2xl border p-3 ${
        value.foodItemId === hit.id ? 'border-saffron-400 bg-saffron-50' : 'border-ink/10 bg-paper'
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View className="flex-row gap-1">
          {hit.images.slice(0, 3).map((src) => (
            <TouchableOpacity
              key={`${hit.id}-${src}`}
              onPress={() => onSelect(hit, src)}
              className="border-ink/10 overflow-hidden rounded-xl border"
              style={{ width: 44, height: 44 }}
            >
              <Image source={{ uri: src }} contentFit="cover" style={{ flex: 1 }} />
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-1">
          <Text className="text-ink font-medium" numberOfLines={1}>
            {hit.name}
          </Text>
          <Text className="text-ash text-xs" numberOfLines={2}>
            {hit.description}
          </Text>
          {hit.source === 'remote' ? (
            <Text className="text-saffron-700 mt-1 text-xs">via Open Food Facts</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const ResultsList = useMemo(() => {
    if (!search.data || search.data.length === 0) return null;
    return <View style={{ gap: 8 }}>{search.data.map((hit) => renderSearchHit(hit))}</View>;
  }, [search.data, value.foodItemId]);

  const tileGap = 8;
  const tileCols = 3;
  const tile =
    (windowWidth - 24 - tileGap * (tileCols - 1)) / tileCols || (windowWidth - 24) / tileCols;
  const galleryItems = useMemo(() => {
    const byCountry =
      countryFilter === 'all'
        ? browseItems
        : browseItems.filter((item) => item.originCountryIso2 === countryFilter);
    return [...byCountry].sort((a, b) =>
      sortMode === 'name-asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );
  }, [browseItems, countryFilter, sortMode]);
  const galleryContent = (() => {
    if (browseGallery.isLoading) {
      return (
        <View className="py-8">
          <ActivityIndicator size="large" />
        </View>
      );
    }
    if (!galleryItems.length) {
      return (
        <Text className="text-ash py-6 text-sm">
          {t(['productPicker', 'emptyCatalogHint'], 'No catalog rows yet.')}
        </Text>
      );
    }
    return (
      <View className="flex-row flex-wrap pb-4" style={{ gap: tileGap }}>
        {galleryItems.map((item) => {
          const hit = browseItemToSearchHit(item);
          const src = hit.images[0] ?? fallbackImageForItem(item.name, item.originCountryIso2);
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                onSelect(hit, src);
                setPicsOpen(false);
              }}
              style={{ width: tile, height: tile }}
              className="border-ink/10 bg-bone overflow-hidden rounded-2xl border"
            >
              {src ? (
                <Image source={{ uri: src }} contentFit="cover" style={{ flex: 1 }} />
              ) : (
                <View className="flex-1 items-center justify-center gap-1 p-1">
                  <Text accessible={false} className="text-2xl">
                    {flagEmojiForIso2(item.originCountryIso2)}
                  </Text>
                  <Text className="text-ink text-center text-[10px] leading-snug" numberOfLines={4}>
                    {item.name}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  })();

  return (
    <View style={{ gap: 12 }}>
      <View className="border-ink/10 bg-paper flex-row items-center rounded-2xl border px-4 py-3">
        <TextInput
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            onChange({
              ...value,
              foodItemId: undefined,
              freeformName: t,
            });
          }}
          placeholder={t(['productPicker', 'searchPlaceholder'], 'Krówki, Mastiha, Manner…')}
          placeholderTextColor="#9A9081"
          style={{ flex: 1 }}
          className="text-ink"
        />
        {search.isFetching ? <ActivityIndicator size="small" /> : null}
      </View>

      {ResultsList}

      <View className="border-ink/10 bg-bone/40 rounded-2xl border p-3" style={{ gap: 8 }}>
        <Text className="text-ink text-sm font-medium">
          {t(['productPicker', 'emptyCatalogHint'], "Can't find it?")}
        </Text>
        <TouchableOpacity
          onPress={() => setPicsOpen(true)}
          className="border-saffron-300/60 bg-saffron-50 rounded-xl border border-dashed px-3 py-3"
        >
          <Text className="text-saffron-900 text-center text-sm font-medium">Pics</Text>
          <Text className="text-ash mt-1 text-center text-[10px]">
            Browse catalog photos (EU seed list)
          </Text>
        </TouchableOpacity>
        <View className="flex-row gap-2">
          <TextInput
            value={pasteUrl}
            onChangeText={setPasteUrl}
            placeholder={t(['productPicker', 'pasteUrlLabel'], 'Paste an image URL')}
            placeholderTextColor="#9A9081"
            style={{ flex: 1 }}
            className="border-ink/10 bg-paper text-ink rounded-xl border px-3 py-2 text-xs"
          />
          <TouchableOpacity
            onPress={onPaste}
            disabled={!pasteUrl || fetchRemote.isPending}
            className="bg-ink justify-center rounded-xl px-3"
          >
            <Text className="text-paper text-xs font-medium">
              {fetchRemote.isPending ? '…' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-ash text-[10px]">
          We download, strip EXIF and re-host on Eushop — your buyers never see the source URL.
        </Text>
      </View>

      {value.photos.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {value.photos.map((p, idx) => (
            <View
              key={p.url + idx}
              className="bg-bone overflow-hidden rounded-xl"
              style={{ width: 64, height: 64 }}
            >
              <Image source={{ uri: p.url }} contentFit="cover" style={{ flex: 1 }} />
            </View>
          ))}
        </View>
      ) : null}

      <Modal
        visible={picsOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPicsOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPicsOpen(false)} />
          <View style={styles.sheet} className="bg-paper">
            <View className="border-ink/10 flex-row items-start justify-between border-b px-4 py-3">
              <View className="max-w-[85%] pr-2">
                <Text className="text-ink font-serif text-xl">
                  {t(['productPicker', 'catalogMatch'], 'Catalog photos')}
                </Text>
                <Text className="text-ash mt-1 text-xs leading-relaxed">
                  Tap a product to use its photo. Items without images show a styled card.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPicsOpen(false)} hitSlop={12}>
                <Text className="text-ink text-sm font-medium">
                  {t(['tripDetailMobile', 'back'], 'Close')}
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView className="px-3 pb-6" keyboardShouldPersistTaps="handled">
              <View className="mb-3 flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setSortMode((s) => (s === 'name-asc' ? 'name-desc' : 'name-asc'))}
                  className="border-ink/15 bg-bone rounded-xl border px-3 py-2"
                >
                  <Text className="text-ink text-xs">
                    {sortMode === 'name-asc' ? 'Sort A-Z' : 'Sort Z-A'}
                  </Text>
                </TouchableOpacity>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => setCountryFilter('all')}
                      className={`rounded-xl border px-3 py-2 ${
                        countryFilter === 'all'
                          ? 'border-saffron-400 bg-saffron-50'
                          : 'border-ink/15 bg-bone'
                      }`}
                    >
                      <Text className="text-ink text-xs">
                        {t(['nav', 'countries'], 'All countries')}
                      </Text>
                    </TouchableOpacity>
                    {availableCountryIso2.map((iso2) => (
                      <TouchableOpacity
                        key={iso2}
                        onPress={() => setCountryFilter(iso2)}
                        className={`rounded-xl border px-3 py-2 ${
                          countryFilter === iso2
                            ? 'border-saffron-400 bg-saffron-50'
                            : 'border-ink/15 bg-bone'
                        }`}
                      >
                        <Text className="text-ink text-xs">
                          {flagEmojiForIso2(iso2)} {countryNameForIso2(iso2)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
              {galleryContent}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(24, 20, 16, 0.45)',
  },
  sheet: {
    maxHeight: '88%',
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
});
