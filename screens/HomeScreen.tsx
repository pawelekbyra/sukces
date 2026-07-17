import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { useStore } from '../lib/store';
import { currentStreak, totalKm, currentNetWorth } from '../lib/selectors';
import { HABITS } from '../lib/types';
import { colors, spacing, radius } from '../lib/theme';

export default function HomeScreen({ navigation }: any) {
  const state = useStore();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {HABITS.map((h) => {
          const streak = currentStreak(state, h.id);
          return (
            <Row
              key={h.id}
              label={h.label}
              value={`${streak} ${dayWord(streak)} bez relapsu`}
              valueColor={streak > 0 ? colors.habitGreen : colors.textDim}
              onPress={() => navigation.navigate('Habit', { habitId: h.id, label: h.label })}
            />
          );
        })}

        <Row
          label="Kilometry"
          value={`${totalKm(state)} km`}
          valueColor={colors.runBlue}
          onPress={() => navigation.navigate('Running')}
        />

        <Row
          label="Hajs"
          value={`${currentNetWorth(state)} zł`}
          valueColor={colors.financeGold}
          onPress={() => navigation.navigate('Finance')}
        />
      </View>
    </SafeAreaView>
  );
}

function dayWord(n: number): string {
  if (n === 1) return 'dzień';
  return 'dni';
}

function Row({
  label,
  value,
  valueColor,
  onPress,
}: {
  label: string;
  value: string;
  valueColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, { color: valueColor }]}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.md, gap: spacing.sm },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginBottom: spacing.md },
  row: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: { color: colors.text, fontSize: 17, fontWeight: '500' },
  rowValue: { fontSize: 17, fontWeight: '700' },
});
