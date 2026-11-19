import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import type { TemplateListItem } from '@/lib/templates';
import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

export function TemplateCard({
  item,
  onUse,
  onEdit,
  onDuplicate,
  onDelete,
  onFavorite,
  onSaveCopy,
}: {
  item: TemplateListItem;
  onUse: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
  onSaveCopy?: () => void;
}) {
  const { colors } = useAppTheme();
  const blanks = item.variableNames.length;
  return (
    <View style={[styles.card, { backgroundColor: colors.elevated, borderColor: colors.line }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.name, { color: colors.ink, fontFamily: fonts.display }]}>{item.name}</Text>
        {item.source === 'saved' && onFavorite ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.favorite ? `Remove ${item.name} from favorites` : `Favorite ${item.name}`}
            accessibilityState={{ selected: item.favorite }}
            onPress={onFavorite}
            style={styles.star}>
            <Text style={{ color: item.favorite ? colors.favorite : colors.muted, fontSize: 20 }}>
              {item.favorite ? '★' : '☆'}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Text numberOfLines={2} style={[styles.description, { color: colors.muted, fontFamily: fonts.body }]}>
        {item.description}
      </Text>
      <View style={styles.badges}>
        {item.kind === 'agent' ? (
          <Text style={[styles.badge, { color: colors.accentSoftInk, backgroundColor: colors.accentSoft, fontFamily: fonts.bodyMedium }]}>
            Agent
          </Text>
        ) : null}
        {blanks > 0 ? (
          <Text style={[styles.badge, { color: colors.muted, backgroundColor: colors.bg, fontFamily: fonts.bodyMedium }]}>
            {blanks === 1 ? '1 blank' : `${blanks} blanks`}
          </Text>
        ) : null}
      </View>
      <Button label="Use" accessibilityLabel={`Use ${item.name}`} onPress={onUse} />
      {item.source === 'saved' ? (
        <View style={styles.row}>
          <Button label="Edit" accessibilityLabel={`Edit ${item.name}`} variant="secondary" onPress={onEdit ?? (() => undefined)} style={styles.flex} />
          <Button
            label="Duplicate"
            accessibilityLabel={`Duplicate ${item.name}`}
            variant="secondary"
            onPress={onDuplicate ?? (() => undefined)}
            style={styles.flex}
          />
          <Button
            label="Delete"
            accessibilityLabel={`Delete ${item.name}`}
            variant="danger"
            onPress={onDelete ?? (() => undefined)}
            style={styles.flex}
          />
        </View>
      ) : (
        <Button
          label="Save a copy"
          accessibilityLabel={`Save a copy of ${item.name}`}
          variant="secondary"
          onPress={onSaveCopy ?? (() => undefined)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
  },
  star: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flex: {
    flex: 1,
    paddingHorizontal: 8,
  },
});
