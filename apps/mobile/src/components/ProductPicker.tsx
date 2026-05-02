import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { trpc } from '../lib/trpc';

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

export function ProductPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState(value.freeformName ?? '');
  const [debouncedQ, setDebouncedQ] = useState(query);
  const [pasteUrl, setPasteUrl] = useState('');

  useEffect(() => {
    const h = setTimeout(() => setDebouncedQ(query), 300);
    return () => clearTimeout(h);
  }, [query]);

  const search = trpc.catalog.searchWithSuggestions.useQuery(
    { q: debouncedQ, limit: 6, includeRemote: true },
    { enabled: debouncedQ.length >= 2 },
  );
  const fetchRemote = trpc.media.fetchRemoteImage.useMutation();

  const onSelect = (hit: NonNullable<typeof search.data>[number], imageUrl?: string) => {
    const pickedImage = imageUrl ?? hit.images[0];
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
      Alert.alert('Image error', e instanceof Error ? e.message : 'Could not fetch the image');
    }
  };

  const ResultsList = useMemo(() => {
    if (!search.data || search.data.length === 0) return null;
    return (
      <View style={{ gap: 8 }}>
        {search.data.map((hit) => (
          <TouchableOpacity
            key={hit.id}
            onPress={() => onSelect(hit)}
            className={`rounded-2xl border p-3 ${
              value.foodItemId === hit.id
                ? 'border-saffron-400 bg-saffron-50'
                : 'border-ink/10 bg-paper'
            }`}
          >
            <View className="flex-row items-center gap-3">
              <View className="flex-row gap-1">
                {hit.images.slice(0, 3).map((src, i) => (
                  <TouchableOpacity
                    key={`${src}-${i}`}
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
        ))}
      </View>
    );
  }, [search.data, value.foodItemId]);

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
          placeholder="Krówki, Mastiha, Manner…"
          placeholderTextColor="#9A9081"
          style={{ flex: 1 }}
          className="text-ink"
        />
        {search.isFetching ? <ActivityIndicator size="small" /> : null}
      </View>

      {ResultsList}

      <View className="border-ink/10 bg-bone/40 rounded-2xl border p-3" style={{ gap: 8 }}>
        <Text className="text-ink text-sm font-medium">Can't find it?</Text>
        <View className="flex-row gap-2">
          <TextInput
            value={pasteUrl}
            onChangeText={setPasteUrl}
            placeholder="Paste an image URL"
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
    </View>
  );
}
