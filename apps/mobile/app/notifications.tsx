import { Stack } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { Card } from '../src/components/Card';
import { EmptyState } from '../src/components/EmptyState';
import { trpc } from '../src/lib/trpc';

/**
 * Mirror of the web `/notifications` page, scaled for thumbs. Pulls from
 * `notifications.list` and groups by read/unread; pull-to-refresh wakes the
 * Inngest fan-out subscriptions on demand.
 */
export default function NotificationsScreen() {
  const list = trpc.notifications.list.useQuery(undefined, { retry: false });
  const markAll = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => list.refetch(),
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <View className="bg-paper flex-1">
        <View className="px-6 pt-8 pb-4">
          <Text className="text-ash text-xs tracking-widest uppercase">Inbox</Text>
          <Text className="text-ink mt-1 font-serif text-3xl">Notifications</Text>
          <Text className="text-ink/70 mt-2 text-sm">
            Reservation updates, new matches for your requests, and trip-departure reminders.
          </Text>
        </View>

        {list.isLoading ? (
          <View className="mt-12 items-center">
            <ActivityIndicator />
          </View>
        ) : list.isError ? (
          <View className="px-6">
            <EmptyState
              title="Couldn’t load your inbox"
              hint="Pull down to retry once your connection is back."
            />
          </View>
        ) : (
          <FlatList
            data={list.data ?? []}
            keyExtractor={(n) => n.id}
            contentContainerStyle={{ padding: 24, paddingBottom: 88 }}
            refreshControl={
              <RefreshControl refreshing={list.isFetching} onRefresh={() => list.refetch()} />
            }
            ListEmptyComponent={
              <EmptyState title="All caught up" hint="No notifications waiting." />
            }
            ListHeaderComponent={
              (list.data?.length ?? 0) > 0 ? (
                <View className="mb-4">
                  <Text
                    onPress={() => markAll.mutate()}
                    accessibilityRole="button"
                    accessibilityLabel="Mark all notifications as read"
                    className="text-saffron-700 text-sm font-medium"
                  >
                    {markAll.isPending ? 'Marking…' : 'Mark all as read'}
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <Card
                className={`mb-3 ${item.readAt ? 'opacity-70' : ''}`}
                accessibilityLabel={`Notification: ${item.title}`}
              >
                <Text className="text-ink font-medium">{item.title}</Text>
                {item.body ? (
                  <Text className="text-ink/70 mt-1 text-sm leading-relaxed">{item.body}</Text>
                ) : null}
                <Text className="text-ash mt-2 text-[10px]">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </Card>
            )}
          />
        )}
      </View>
    </>
  );
}
